/**
 * Revert GFM callout syntax back to Docusaurus ::: admonition syntax.
 * The remarkAdmonition plugin handles ::: syntax natively.
 * Run: bun scripts/revert-admonitions.ts
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS_DIR = join(import.meta.dirname, '..', 'content', 'docs');

const GFM_TO_ADMONITION: Record<string, string> = {
  NOTE: 'note',
  TIP: 'tip',
  WARNING: 'warning',
  CAUTION: 'danger',
  IMPORTANT: 'important',
};

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function main() {
  const allFiles = await walk(DOCS_DIR);
  const mdFiles = allFiles.filter((f) => /\.(md|mdx)$/.test(f));
  let count = 0;

  for (const filePath of mdFiles) {
    let content = await readFile(filePath, 'utf-8');
    const original = content;

    // Match > [!TYPE] optionally followed by title, then quoted lines
    content = content.replace(
      /^> \[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\](?: (.+))?\n((?:> .*\n?)*)/gm,
      (_match, type: string, title: string | undefined, body: string) => {
        const adType = GFM_TO_ADMONITION[type] || 'note';
        const lines = body
          .split('\n')
          .filter((l) => l.length > 0)
          .map((l) => l.replace(/^> /, ''))
          .join('\n');
        const titleStr = title ? `[${title}]` : '';
        return `:::${adType}${titleStr}\n${lines}\n:::\n`;
      },
    );

    if (content !== original) {
      await writeFile(filePath, content);
      count++;
    }
  }

  console.log(`Reverted admonitions in ${count} files`);
}

main().catch(console.error);
