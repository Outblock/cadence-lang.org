# cadence-lang.org

The official documentation and marketing site for [Cadence](https://github.com/onflow/cadence), the resource-oriented programming language for the [Flow blockchain](https://flow.com).

Live at [cadence-lang.org](https://cadence-lang.org).

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — SSR framework with file-based routing
- [Fumadocs](https://fumadocs.vercel.app/) — MDX documentation engine
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [@vercel/og](https://vercel.com/docs/functions/og-image-generation) — dynamic OG image generation
- [Shiki](https://shiki.style/) — syntax highlighting with custom Cadence grammar

## Development

Requirements: [Node.js](https://nodejs.org/) 20+, [Bun](https://bun.sh/)

```sh
git clone https://github.com/onflow/cadence-lang.org.git
cd cadence-lang.org
bun install
bun run dev
```

Dev server runs at http://localhost:3000.

### Commands

```sh
bun run dev          # Start dev server
bun run build        # Production build + sitemap
bun run start        # Run production server
bun run types:check  # TypeScript type checking
```

### Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```sh
VITE_SITE_URL=https://cadence-lang.org  # Base URL for meta/OG tags
ANTHROPIC_API_KEY=                       # Server-only, for AI chat
```

## Documentation

All docs are MDX files in `content/docs/`. Cadence syntax highlighting is supported via a custom TextMate grammar.

## MCP Server

The `mcp-server/` directory contains a standalone [Model Context Protocol](https://modelcontextprotocol.io/) server published to npm as `@outblock/cadence-mcp`. See `mcp-server/README.md` for details.

## AI Integration

- `/llms.txt` and `/llms-full.txt` — LLM-optimized documentation endpoints
- `skills/cadence/SKILL.md` — compact AI skill reference, auto-updated by CI
- `/api/search` — full-text search API
- `/api/chat` — Claude-powered chat (requires `ANTHROPIC_API_KEY`)

## Deployment

Deployed to [Vercel](https://vercel.com) automatically on push to `main`.
