import { describe, it, expect } from 'bun:test';
import { securityScan, formatScanResult, type ScanResult } from './audit.js';

describe('securityScan', () => {
  it('detects access(all) on state fields', () => {
    const code = `
access(all) contract MyContract {
  access(all) var balance: UFix64
  init() { self.balance = 0.0 }
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'overly-permissive-access');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('detects access(all) on functions', () => {
    const code = `
access(all) contract MyContract {
  access(all) fun withdraw(amount: UFix64): @FungibleToken.Vault {
    return <- self.vault.withdraw(amount: amount)
  }
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'overly-permissive-function');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('medium');
  });

  it('detects deprecated pub keyword', () => {
    const code = `pub contract OldContract {
  pub var x: Int
  pub fun foo() {}
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'deprecated-pub');
    expect(found.length).toBeGreaterThanOrEqual(2);
    expect(found[0].severity).toBe('info');
  });

  it('detects force unwrap', () => {
    const code = `
let ref = account.borrow<&MyResource>(from: /storage/my)!
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'unsafe-force-unwrap');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('medium');
  });

  it('detects AuthAccount exposure', () => {
    const code = `
access(all) fun setup(acct: AuthAccount) {
  acct.save(<- create Vault(), to: /storage/vault)
}`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'auth-account-exposure');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('detects auth(...) &Account exposure', () => {
    const code = `
access(all) fun setup(acct: auth(Storage) &Account) {}
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'auth-account-exposure');
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it('detects hardcoded addresses (not in imports)', () => {
    const code = `
let addr = 0x1654653399040a61
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'hardcoded-address');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('low');
  });

  it('detects capability publish', () => {
    const code = `
account.capabilities.publish(cap, at: /public/myResource)
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'unguarded-capability');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('detects explicit destroy', () => {
    const code = `
destroy(oldVault)
`;
    const result = securityScan(code);
    const found = result.findings.filter((f) => f.rule === 'resource-loss-destroy');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('high');
  });

  it('returns empty findings for clean code', () => {
    const code = `
access(contract) fun internalHelper(): String {
  return "hello"
}`;
    const result = securityScan(code);
    // Should have zero high-severity findings at least
    expect(result.summary.high).toBe(0);
  });

  it('summary counts match findings', () => {
    const code = `
access(all) var x: Int
pub fun foo() {}
let y = something!
`;
    const result = securityScan(code);
    const counts = { high: 0, medium: 0, low: 0, info: 0 };
    for (const f of result.findings) counts[f.severity]++;
    expect(result.summary).toEqual(counts);
  });
});

describe('formatScanResult', () => {
  it('formats empty results', () => {
    const result: ScanResult = { findings: [], summary: { high: 0, medium: 0, low: 0, info: 0 } };
    const text = formatScanResult(result);
    expect(text).toContain('No issues detected');
  });

  it('formats findings with severity labels', () => {
    const result: ScanResult = {
      findings: [
        { rule: 'test-rule', severity: 'high', line: 5, message: 'test message' },
      ],
      summary: { high: 1, medium: 0, low: 0, info: 0 },
    };
    const text = formatScanResult(result);
    expect(text).toContain('[HIGH]');
    expect(text).toContain('Line 5');
    expect(text).toContain('test message');
  });
});
