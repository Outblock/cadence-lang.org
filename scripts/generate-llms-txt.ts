/**
 * Generate llms.txt and llms-full.txt from content/docs.
 * Run: bun scripts/generate-llms-txt.ts
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const SITE_URL = 'https://cadence-lang.org';
const DOCS_DIR = join(import.meta.dirname, '..', 'content', 'docs');
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public');

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractFrontmatter(content: string): { title?: string; description?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = match[1];
  const title = fm.match(/^title:\s*(.+)/m)?.[1]?.replace(/^["']|["']$/g, '');
  const description = fm.match(/^description:\s*(.+)/m)?.[1]?.replace(/^["']|["']$/g, '');
  return { title, description };
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}

function getDocUrl(file: string): string {
  const rel = file.replace(DOCS_DIR, '').replace(/\\/g, '/');
  const name = basename(rel, extname(rel));
  const dir = rel.replace(/\/[^/]+$/, '');
  const slug = name === 'index' ? dir : `${dir}/${name}`;
  return `${SITE_URL}/docs${slug}`;
}

async function main() {
  const files = (await walk(DOCS_DIR)).sort();

  // llms.txt — summary version
  const summaryLines = [
    '# Cadence Programming Language',
    '',
    '> Cadence is a resource-oriented programming language for smart contracts on Flow.',
    '> It features strong static types, resource-oriented programming, and capability-based access control.',
    '',
    '## Documentation',
    '',
  ];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const { title, description } = extractFrontmatter(content);
    const url = getDocUrl(file);
    const desc = description ? `: ${description}` : '';
    summaryLines.push(`- [${title || basename(file, extname(file))}](${url})${desc}`);
  }

  await writeFile(join(PUBLIC_DIR, 'llms.txt'), summaryLines.join('\n') + '\n');
  console.log(`Generated llms.txt with ${files.length} entries`);

  // llms-full.txt — full content version
  const fullLines = [
    '# Cadence Programming Language — Full Documentation',
    '',
  ];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const { title } = extractFrontmatter(content);
    const url = getDocUrl(file);
    const body = stripFrontmatter(content);

    fullLines.push(`---`);
    fullLines.push(`## ${title || basename(file, extname(file))}`);
    fullLines.push(`URL: ${url}`);
    fullLines.push('');
    fullLines.push(body.trim());
    fullLines.push('');
  }

  await writeFile(join(PUBLIC_DIR, 'llms-full.txt'), fullLines.join('\n') + '\n');
  console.log(`Generated llms-full.txt`);
}

main().catch(console.error);
