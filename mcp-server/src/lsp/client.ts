import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { writeFile, unlink, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface Diagnostic {
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  severity?: number; // 1=Error, 2=Warning, 3=Info, 4=Hint
  message: string;
  source?: string;
}

const SEVERITY_LABELS: Record<number, string> = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'hint',
};

export interface LSPClientOptions {
  flowCommand?: string;
  network?: string;
}

export class CadenceLSPClient extends EventEmitter {
  private process: ChildProcess | null = null;
  private pendingRequests = new Map<number, PendingRequest>();
  private nextId = 1;
  private buffer = Buffer.alloc(0);
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private flowCommand: string;
  private network: string;

  constructor(flowCommandOrOpts: string | LSPClientOptions = 'flow') {
    super();
    if (typeof flowCommandOrOpts === 'string') {
      this.flowCommand = flowCommandOrOpts;
      this.network = 'mainnet';
    } else {
      this.flowCommand = flowCommandOrOpts.flowCommand ?? 'flow';
      this.network = flowCommandOrOpts.network ?? 'mainnet';
    }
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      this.process = spawn(this.flowCommand, ['cadence', 'language-server', '--enable-flow-client=false'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (e: any) {
      throw new Error(`Failed to start Flow CLI: ${e.message}`);
    }

    // Handle spawn error (e.g. executable not found)
    await new Promise<void>((resolve, reject) => {
      this.process!.on('error', (err) => reject(new Error(`Failed to start Flow CLI: ${err.message}`)));
      this.process!.on('spawn', () => resolve());
    });

    this.process.stdout!.on('data', (data: Buffer) => this.onData(data));
    this.process.stderr!.on('data', (data: Buffer) => {
      console.error('[LSP stderr]', data.toString());
    });

    this.process.on('exit', (code) => {
      console.error(`[LSP] process exited with code ${code}`);
      this.initialized = false;
      this.initPromise = null;
      for (const [, req] of this.pendingRequests) {
        req.reject(new Error('LSP process exited'));
        clearTimeout(req.timer);
      }
      this.pendingRequests.clear();
    });

    await this.request('initialize', {
      processId: process.pid,
      capabilities: {
        textDocument: {
          hover: { contentFormat: ['markdown', 'plaintext'] },
          definition: {},
          references: {},
          documentSymbol: {},
          publishDiagnostics: {},
        },
      },
      rootUri: null,
      workspaceFolders: null,
      initializationOptions: {
        accessCheckMode: 'strict',
      },
    });

    this.notify('initialized', {});
    this.initialized = true;
  }

  private onData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);
    while (this.tryParseMessage()) {}
  }

  private tryParseMessage(): boolean {
    const headerEnd = this.buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return false;

    const header = this.buffer.subarray(0, headerEnd).toString('ascii');
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) return false;

    const contentLength = parseInt(match[1], 10);
    const bodyStart = headerEnd + 4;
    if (this.buffer.length < bodyStart + contentLength) return false;

    const body = this.buffer.subarray(bodyStart, bodyStart + contentLength).toString('utf-8');
    this.buffer = this.buffer.subarray(bodyStart + contentLength);

    try {
      const message = JSON.parse(body);
      this.handleMessage(message);
    } catch (e) {
      console.error('[LSP] Failed to parse message:', e);
    }

    return true;
  }

  private handleMessage(message: any): void {
    if ('id' in message && message.id !== undefined) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        this.pendingRequests.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      }
      return;
    }

    if (message.method) {
      this.emit('notification', message.method, message.params);
      this.emit(message.method, message.params);
    }
  }

  async request(method: string, params: any, timeoutMs = 30000): Promise<any> {
    if (method !== 'initialize') {
      await this.ensureInitialized();
    }

    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`LSP request '${method}' timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      this.send({ jsonrpc: '2.0', id, method, params });
    });
  }

  notify(method: string, params: any): void {
    this.send({ jsonrpc: '2.0', method, params });
  }

  private send(message: any): void {
    if (!this.process?.stdin?.writable) {
      throw new Error('LSP process not available');
    }
    const body = JSON.stringify(message);
    const contentLength = Buffer.byteLength(body, 'utf-8');
    this.process.stdin.write(`Content-Length: ${contentLength}\r\n\r\n${body}`);
  }

  async shutdown(): Promise<void> {
    if (!this.process || this.process.killed) return;
    try {
      await this.request('shutdown', null, 5000);
      this.notify('exit', null);
    } catch {
      this.process.kill();
    }
  }

  // --- High-level API ---

  async openDocument(uri: string, content: string): Promise<void> {
    await this.ensureInitialized();
    this.notify('textDocument/didOpen', {
      textDocument: { uri, languageId: 'cadence', version: 1, text: content },
    });
  }

  async closeDocument(uri: string): Promise<void> {
    this.notify('textDocument/didClose', {
      textDocument: { uri },
    });
  }

  async hover(uri: string, line: number, character: number): Promise<any> {
    return this.request('textDocument/hover', {
      textDocument: { uri },
      position: { line, character },
    });
  }

  async definition(uri: string, line: number, character: number): Promise<any> {
    return this.request('textDocument/definition', {
      textDocument: { uri },
      position: { line, character },
    });
  }

  async documentSymbols(uri: string): Promise<any> {
    return this.request('textDocument/documentSymbol', {
      textDocument: { uri },
    });
  }

  async references(uri: string, line: number, character: number): Promise<any> {
    return this.request('textDocument/references', {
      textDocument: { uri },
      position: { line, character },
      context: { includeDeclaration: true },
    });
  }

  /**
   * Open a virtual document and wait for diagnostics from the LSP.
   * Returns formatted diagnostics.
   */
  async checkCode(code: string, filename = 'check.cdc'): Promise<Diagnostic[]> {
    await this.ensureInitialized();
    const uri = `file:///tmp/cadence-mcp/${filename}`;

    return new Promise<Diagnostic[]>((resolve) => {
      const timeout = setTimeout(() => {
        this.removeListener('textDocument/publishDiagnostics', handler);
        this.closeDocument(uri);
        resolve([]);
      }, 10000);

      const handler = (params: any) => {
        if (params.uri === uri) {
          clearTimeout(timeout);
          this.removeListener('textDocument/publishDiagnostics', handler);
          this.closeDocument(uri);
          resolve(params.diagnostics || []);
        }
      };

      this.on('textDocument/publishDiagnostics', handler);
      this.openDocument(uri, code);
    });
  }

  /** Format diagnostics into a human/AI readable string */
  static formatDiagnostics(diagnostics: Diagnostic[]): string {
    if (diagnostics.length === 0) return 'No errors found.';

    return diagnostics
      .map((d) => {
        const severity = SEVERITY_LABELS[d.severity ?? 1] ?? 'error';
        const loc = `line ${d.range.start.line + 1}:${d.range.start.character + 1}`;
        return `[${severity}] ${loc}: ${d.message}`;
      })
      .join('\n');
  }

  /** Format hover result into readable text */
  static formatHover(result: any): string {
    if (!result?.contents) return 'No information available.';
    const contents = result.contents;
    if (typeof contents === 'string') return contents;
    if (contents.value) return contents.value;
    if (Array.isArray(contents)) {
      return contents
        .map((c: any) => (typeof c === 'string' ? c : c.value || ''))
        .filter(Boolean)
        .join('\n\n');
    }
    return JSON.stringify(contents);
  }

  /** Format document symbols into readable text */
  static formatSymbols(symbols: any[], indent = 0): string {
    if (!symbols?.length) return 'No symbols found.';

    const lines: string[] = [];
    for (const sym of symbols) {
      const kindName = SYMBOL_KINDS[sym.kind] ?? `kind(${sym.kind})`;
      const prefix = '  '.repeat(indent);
      const detail = sym.detail ? ` — ${sym.detail}` : '';
      lines.push(`${prefix}${kindName} ${sym.name}${detail}`);
      if (sym.children?.length) {
        lines.push(CadenceLSPClient.formatSymbols(sym.children, indent + 1));
      }
    }
    return lines.join('\n');
  }
}

export const VALID_NETWORKS = ['mainnet', 'testnet', 'emulator'] as const;
export type FlowNetwork = (typeof VALID_NETWORKS)[number];

/**
 * Manages multiple LSP clients, one per network.
 * Lazily initializes clients on first use.
 */
export class LSPManager {
  private clients = new Map<string, CadenceLSPClient>();
  private flowCommand: string;

  constructor(flowCommand = 'flow') {
    this.flowCommand = flowCommand;
  }

  async getClient(network: FlowNetwork = 'mainnet'): Promise<CadenceLSPClient> {
    let client = this.clients.get(network);
    if (client) return client;

    client = new CadenceLSPClient({ flowCommand: this.flowCommand, network });
    await client.ensureInitialized();
    this.clients.set(network, client);
    return client;
  }

  /**
   * Check code via `flow scripts execute` on-chain.
   * Works for scripts with address imports that the LSP can't resolve.
   */
  async checkCodeViaCLI(code: string, network: FlowNetwork = 'mainnet'): Promise<Diagnostic[]> {
    const configPath = process.env.FLOW_CONFIG_PATH || join(import.meta.dirname, '..', '..', 'flow.json');
    const tmpDir = await mkdtemp(join(tmpdir(), 'cadence-mcp-'));
    const tmpFile = join(tmpDir, 'check.cdc');
    await writeFile(tmpFile, code, 'utf-8');

    try {
      const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
        execFile(
          this.flowCommand,
          ['scripts', 'execute', tmpFile, '--network', network, '-f', configPath, '--output', 'json'],
          { timeout: 30000 },
          (error, stdout, stderr) => {
            resolve({ stdout: stdout ?? '', stderr: stderr ?? '', code: error?.code ?? 0 });
          },
        );
      });

      if (result.code === 0) {
        return []; // No errors
      }

      // Parse errors from stderr
      return parseCLIErrors(result.stderr);
    } finally {
      await unlink(tmpFile).catch(() => {});
    }
  }

  async shutdown(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.shutdown();
    }
    this.clients.clear();
  }
}

/** Detect if code has address imports like `import X from 0xabc123` */
export function hasAddressImports(code: string): boolean {
  return /import\s+\w+\s+from\s+0x[0-9a-fA-F]+/m.test(code);
}

/** Parse Flow CLI error output into Diagnostic objects */
function parseCLIErrors(stderr: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Match patterns like:
  // error: message \n --> hash:line:col
  // or: /path/file.cdc:line:col: semantic-error: message
  const errorPattern = /error:\s*(.+?)(?:\s*-->\s*\S+:(\d+):(\d+))?(?:\n|$)/g;
  const lintPattern = /:\s*(\d+):(\d+):\s*(semantic-error|error|warning|info):\s*(.+)/g;

  let match;
  while ((match = lintPattern.exec(stderr)) !== null) {
    const line = parseInt(match[1], 10) - 1;
    const char = parseInt(match[2], 10) - 1;
    const severity = match[3] === 'warning' ? 2 : 1;
    diagnostics.push({
      range: { start: { line, character: char }, end: { line, character: char } },
      severity,
      message: match[4].trim(),
    });
  }

  if (diagnostics.length > 0) return diagnostics;

  // Fallback: parse runtime error format
  while ((match = errorPattern.exec(stderr)) !== null) {
    const message = match[1].trim();
    const line = match[2] ? parseInt(match[2], 10) - 1 : 0;
    const char = match[3] ? parseInt(match[3], 10) - 1 : 0;
    if (message && !message.startsWith('See documentation') && !message.startsWith('Was this error')) {
      diagnostics.push({
        range: { start: { line, character: char }, end: { line, character: char } },
        severity: 1,
        message,
      });
    }
  }

  // If we still couldn't parse, return the raw stderr as a single diagnostic
  if (diagnostics.length === 0 && stderr.trim()) {
    // Extract the most useful part
    const cleaned = stderr.replace(/❌.*?\n/g, '').replace(/🙏.*?\n/g, '').replace(/❗.*?\n/g, '').trim();
    if (cleaned) {
      diagnostics.push({
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        severity: 1,
        message: cleaned.split('\n')[0],
      });
    }
  }

  return diagnostics;
}

const SYMBOL_KINDS: Record<number, string> = {
  1: 'File',
  2: 'Module',
  3: 'Namespace',
  4: 'Package',
  5: 'Class',
  6: 'Method',
  7: 'Property',
  8: 'Field',
  9: 'Constructor',
  10: 'Enum',
  11: 'Interface',
  12: 'Function',
  13: 'Variable',
  14: 'Constant',
  15: 'String',
  16: 'Number',
  17: 'Boolean',
  18: 'Array',
  19: 'Object',
  20: 'Key',
  21: 'Null',
  22: 'EnumMember',
  23: 'Struct',
  24: 'Event',
  25: 'Operator',
  26: 'TypeParameter',
};
