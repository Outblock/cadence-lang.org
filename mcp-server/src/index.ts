import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { searchDocs, getDoc } from './search.js';

const server = new McpServer({
  name: 'cadence-docs',
  version: '1.0.0',
});

server.tool(
  'search_docs',
  'Search Cadence documentation by query',
  { query: z.string().describe('Search query'), top_n: z.number().optional().describe('Number of results (default 5)') },
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
          text: results.length
            ? text
            : `No results found for "${query}"`,
        },
      ],
    };
  },
);

server.tool(
  'get_doc',
  'Get full content of a specific Cadence documentation page',
  { path: z.string().describe('Document path, e.g. /docs/language/resources') },
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
