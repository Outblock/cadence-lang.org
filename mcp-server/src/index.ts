import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CadenceLSPClient } from './lsp/client.js';
import { createServer } from './server.js';

async function main() {
  // Try to start LSP if Flow CLI is available
  let lsp: CadenceLSPClient | undefined;
  try {
    lsp = new CadenceLSPClient(process.env.FLOW_CMD || 'flow');
    await lsp.ensureInitialized();
    console.error('[cadence-mcp] LSP initialized (Flow CLI found)');
  } catch (e) {
    console.error(
      '[cadence-mcp] Flow CLI not found, LSP tools disabled. Doc tools still available.',
    );
    lsp = undefined;
  }

  const server = createServer(lsp);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
