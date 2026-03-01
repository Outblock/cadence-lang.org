import { execFile } from 'node:child_process';
import { extractAddressImports, type FlowNetwork } from './lsp/client.js';

// --- Types ---

export interface ContractInfo {
  name: string;
  address: string;
  source: string;
  imports: string[]; // "0xAddress.ContractName" references
}

export interface ContractTree {
  target: string; // address queried
  network: FlowNetwork;
  contracts: ContractInfo[];
}

export type Severity = 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  rule: string;
  severity: Severity;
  line: number;
  message: string;
}

export interface ScanResult {
  findings: Finding[];
  summary: { high: number; medium: number; low: number; info: number };
}

// --- Contract Source Fetching ---

/**
 * Run `flow accounts get` and parse the JSON output to extract contract names and source code.
 */
export async function fetchAccountContracts(
  address: string,
  network: FlowNetwork,
  flowCommand = 'flow',
): Promise<{ name: string; source: string }[]> {
  const stdout = await new Promise<string>((resolve, reject) => {
    execFile(
      flowCommand,
      ['accounts', 'get', address, '--network', network, '--include', 'contracts', '--output', 'json'],
      { timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to fetch account ${address} on ${network}: ${stderr || error.message}`));
        } else {
          resolve(stdout);
        }
      },
    );
  });

  const data = JSON.parse(stdout);
  const contracts: { name: string; source: string }[] = [];

  // The Flow CLI JSON output has a "contracts" field: { "ContractName": "base64 or raw source" }
  if (data.contracts) {
    for (const [name, codeValue] of Object.entries(data.contracts)) {
      let source: string;
      if (typeof codeValue === 'string') {
        // Try base64 decode; if it fails, treat as raw source
        try {
          source = Buffer.from(codeValue, 'base64').toString('utf-8');
          // Heuristic: if decoded text has a lot of non-printable chars, it's probably raw
          if (/[\x00-\x08\x0e-\x1f]/.test(source.slice(0, 200))) {
            source = codeValue;
          }
        } catch {
          source = codeValue;
        }
      } else {
        source = String(codeValue);
      }
      contracts.push({ name, source });
    }
  }

  return contracts;
}

/**
 * Fetch contract source code from an on-chain address, optionally recursing into dependencies.
 */
export async function fetchContractSource(
  address: string,
  network: FlowNetwork,
  recurse = true,
  flowCommand = 'flow',
): Promise<ContractTree> {
  const visited = new Set<string>(); // "0xAddress" already fetched
  const allContracts: ContractInfo[] = [];
  const queue: string[] = [normalizeAddress(address)];

  while (queue.length > 0) {
    const addr = queue.shift()!;
    if (visited.has(addr)) continue;
    visited.add(addr);

    const accountContracts = await fetchAccountContracts(addr, network, flowCommand);

    for (const { name, source } of accountContracts) {
      const imports = extractAddressImports(source);
      const importRefs = imports.map((i) => `0x${i.address}.${i.name}`);

      allContracts.push({
        name,
        address: addr,
        source,
        imports: importRefs,
      });

      if (recurse) {
        for (const imp of imports) {
          const depAddr = normalizeAddress(`0x${imp.address}`);
          if (!visited.has(depAddr)) {
            queue.push(depAddr);
          }
        }
      }
    }
  }

  return { target: normalizeAddress(address), network, contracts: allContracts };
}

function normalizeAddress(addr: string): string {
  return addr.startsWith('0x') ? addr : `0x${addr}`;
}

// --- Security Scan Rules ---

interface Rule {
  id: string;
  severity: Severity;
  pattern: RegExp;
  message: string | ((match: RegExpExecArray) => string);
  /** If true, match against each line individually. Otherwise full-text. Default: true */
  perLine?: boolean;
}

const RULES: Rule[] = [
  {
    id: 'overly-permissive-access',
    severity: 'high',
    pattern: /access\(all\)\s+(var|let)\s+/,
    message: 'State field with access(all) — consider restricting access with entitlements',
  },
  {
    id: 'overly-permissive-function',
    severity: 'medium',
    pattern: /access\(all\)\s+fun\s+(\w+)/,
    message: (m) => `Function '${m[1]}' has access(all) — review if public access is intended`,
  },
  {
    id: 'deprecated-pub',
    severity: 'info',
    pattern: /\bpub\s+(var|let|fun|resource|struct|event|contract|enum)\b/,
    message: '`pub` is deprecated in Cadence 1.0 — use `access(all)` or a more restrictive access modifier',
  },
  {
    id: 'unsafe-force-unwrap',
    severity: 'medium',
    pattern: /[)\w]\s*!/,
    message: 'Force-unwrap (!) used — consider nil-coalescing (??) or optional binding (if let) for safer handling',
  },
  {
    id: 'auth-account-exposure',
    severity: 'high',
    pattern: /\bAuthAccount\b/,
    message: 'AuthAccount reference found — passing AuthAccount gives full account access, use capabilities instead',
  },
  {
    id: 'auth-account-exposure',
    severity: 'high',
    pattern: /\bauth\s*\(.*?\)\s*&Account\b/,
    message: 'auth(…) &Account reference found — this grants broad account access, prefer scoped capabilities',
  },
  {
    id: 'hardcoded-address',
    severity: 'low',
    pattern: /(?<!import\s+\w+\s+from\s+)0x[0-9a-fA-F]{8,16}\b/,
    message: 'Hardcoded address detected — consider using named address imports for portability',
  },
  {
    id: 'unguarded-capability',
    severity: 'high',
    pattern: /\.publish\s*\(/,
    message: 'Capability published — verify that proper entitlements guard this capability',
  },
  {
    id: 'potential-reentrancy',
    severity: 'medium',
    pattern: /\.borrow\b.*\n.*\bself\./,
    message: 'State modification after external borrow — potential reentrancy risk',
    perLine: false,
  },
  {
    id: 'resource-loss-destroy',
    severity: 'high',
    pattern: /destroy\s*\(/,
    message: 'Explicit destroy call — ensure the resource is intentionally being destroyed and not lost',
  },
];

/**
 * Run static security rules against Cadence source code.
 * Returns structured findings.
 */
export function securityScan(code: string): ScanResult {
  const findings: Finding[] = [];
  const lines = code.split('\n');

  for (const rule of RULES) {
    if (rule.perLine === false) {
      // Full-text matching (for multi-line patterns)
      const re = new RegExp(rule.pattern.source, rule.pattern.flags + (rule.pattern.flags.includes('g') ? '' : 'g'));
      let match: RegExpExecArray | null;
      while ((match = re.exec(code)) !== null) {
        const lineNum = code.slice(0, match.index).split('\n').length;
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          line: lineNum,
          message: typeof rule.message === 'function' ? rule.message(match) : rule.message,
        });
      }
    } else {
      // Per-line matching (default)
      for (let i = 0; i < lines.length; i++) {
        const match = rule.pattern.exec(lines[i]);
        if (match) {
          findings.push({
            rule: rule.id,
            severity: rule.severity,
            line: i + 1,
            message: typeof rule.message === 'function' ? rule.message(match) : rule.message,
          });
        }
        // Reset regex lastIndex for non-global patterns
        rule.pattern.lastIndex = 0;
      }
    }
  }

  // Sort by line number
  findings.sort((a, b) => a.line - b.line);

  const summary = { high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) {
    summary[f.severity]++;
  }

  return { findings, summary };
}

/**
 * Format scan results as readable text.
 */
export function formatScanResult(result: ScanResult): string {
  const lines: string[] = [];

  lines.push(`## Security Scan Results`);
  lines.push(`Found ${result.findings.length} issue(s): ${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low, ${result.summary.info} info`);
  lines.push('');

  if (result.findings.length === 0) {
    lines.push('No issues detected by static analysis rules.');
    return lines.join('\n');
  }

  for (const f of result.findings) {
    const sevLabel = f.severity.toUpperCase();
    lines.push(`- [${sevLabel}] Line ${f.line}: (${f.rule}) ${f.message}`);
  }

  return lines.join('\n');
}
