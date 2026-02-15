import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import takumiPackageJson from '@takumi-rs/core/package.json' with { type: 'json' };

export default defineConfig({
  server: {
    port: 3000,
    watch: {
      ignored: ['**/routeTree.gen.ts'],
    },
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    react(),
    nitro({
      preset: 'vercel',
      vercel: {
        entryFormat: 'node',
        functions: {
          runtime: 'nodejs20.x',
        },
      },
      externals: {
        external: ['@takumi-rs/core'],
        traceInclude: Object.keys(takumiPackageJson.optionalDependencies),
      },
    }),
  ],
});
