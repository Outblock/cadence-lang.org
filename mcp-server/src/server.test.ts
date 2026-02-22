import { describe, it, expect } from 'bun:test';
import { createServer } from './server.js';
import { CadenceLSPClient } from './lsp/client.js';

describe('createServer', () => {
  it('creates server with only doc tools when no LSP provided', async () => {
    const server = await createServer();
    // Server should be created without error
    expect(server).toBeDefined();
  });

  it('creates server with all tools when LSP is provided', async () => {
    // Create a client but don't initialize (just for registration)
    const lsp = new CadenceLSPClient('nonexistent');
    const server = await createServer(lsp);
    expect(server).toBeDefined();
  });
});
