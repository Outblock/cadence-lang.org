import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchDocs, getDoc, docsAvailable } from './search.js';
import { CadenceLSPClient } from './lsp/client.js';

export async function createServer(lsp?: CadenceLSPClient): Promise<McpServer> {
  const server = new McpServer({
    name: 'cadence-mcp',
    version: '1.0.0',
  });

  // --- Documentation tools (stateless, only if docs dir exists) ---

  const hasDocs = await docsAvailable();
  if (!hasDocs) {
    console.error('[cadence-mcp] Docs directory not found, doc tools disabled.');
  }

  if (hasDocs) {
  server.tool(
    'search_docs',
    'Search Cadence and Flow documentation by query',
    {
      query: z.string().describe('Search query'),
      top_n: z.number().optional().describe('Number of results (default 5)'),
    },
    async ({ query, top_n }) => {
      const results = await searchDocs(query, top_n ?? 5);
      const text = results
        .map(
          (r) =>
            `## ${r.title}\nPath: ${r.path}\n${r.description}\n\n${r.content.slice(0, 500)}...`,
        )
        .join('\n\n---\n\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: results.length ? text : `No results found for "${query}"`,
          },
        ],
      };
    },
  );

  server.tool(
    'get_doc',
    'Get full content of a specific documentation page (Cadence or Flow)',
    { path: z.string().describe('Document path, e.g. /docs/language/resources or /flow-docs/protocol/staking') },
    async ({ path }) => {
      const doc = await getDoc(path);
      if (!doc) {
        return {
          content: [{ type: 'text' as const, text: `Document not found: ${path}` }],
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: `# ${doc.title}\nPath: ${doc.path}\n\n${doc.content}`,
          },
        ],
      };
    },
  );
  } // end hasDocs

  // --- LSP tools (require Flow CLI) ---

  if (lsp) {
    server.tool(
      'cadence_check',
      'Check Cadence smart contract code for syntax and type errors. Returns diagnostics.',
      {
        code: z.string().describe('Cadence source code to check'),
        filename: z
          .string()
          .optional()
          .describe('Virtual filename (default: check.cdc)'),
      },
      async ({ code, filename }) => {
        const diagnostics = await lsp.checkCode(code, filename);
        return {
          content: [
            {
              type: 'text' as const,
              text: CadenceLSPClient.formatDiagnostics(diagnostics),
            },
          ],
        };
      },
    );

    server.tool(
      'cadence_hover',
      'Get type information and documentation for a symbol at a given position in Cadence code',
      {
        code: z.string().describe('Cadence source code'),
        line: z.number().describe('0-based line number'),
        character: z.number().describe('0-based column number'),
        filename: z.string().optional().describe('Virtual filename'),
      },
      async ({ code, line, character, filename }) => {
        const uri = `file:///tmp/cadence-mcp/${filename ?? 'hover.cdc'}`;
        await lsp.openDocument(uri, code);
        try {
          const result = await lsp.hover(uri, line, character);
          return {
            content: [
              { type: 'text' as const, text: CadenceLSPClient.formatHover(result) },
            ],
          };
        } finally {
          await lsp.closeDocument(uri);
        }
      },
    );

    server.tool(
      'cadence_definition',
      'Find the definition location of a symbol at a given position in Cadence code',
      {
        code: z.string().describe('Cadence source code'),
        line: z.number().describe('0-based line number'),
        character: z.number().describe('0-based column number'),
        filename: z.string().optional().describe('Virtual filename'),
      },
      async ({ code, line, character, filename }) => {
        const uri = `file:///tmp/cadence-mcp/${filename ?? 'def.cdc'}`;
        await lsp.openDocument(uri, code);
        try {
          const result = await lsp.definition(uri, line, character);
          if (!result) {
            return {
              content: [
                { type: 'text' as const, text: 'No definition found.' },
              ],
            };
          }
          const loc = Array.isArray(result) ? result[0] : result;
          const pos = loc.range?.start;
          return {
            content: [
              {
                type: 'text' as const,
                text: `Definition: ${loc.uri} at line ${(pos?.line ?? 0) + 1}:${(pos?.character ?? 0) + 1}`,
              },
            ],
          };
        } finally {
          await lsp.closeDocument(uri);
        }
      },
    );

    server.tool(
      'cadence_symbols',
      'List all symbols (contracts, resources, functions, events, etc.) in Cadence code',
      {
        code: z.string().describe('Cadence source code'),
        filename: z.string().optional().describe('Virtual filename'),
      },
      async ({ code, filename }) => {
        const uri = `file:///tmp/cadence-mcp/${filename ?? 'symbols.cdc'}`;
        await lsp.openDocument(uri, code);
        try {
          const symbols = await lsp.documentSymbols(uri);
          return {
            content: [
              {
                type: 'text' as const,
                text: CadenceLSPClient.formatSymbols(symbols || []),
              },
            ],
          };
        } finally {
          await lsp.closeDocument(uri);
        }
      },
    );
  }

  return server;
}
