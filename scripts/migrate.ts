/**
 * Migration script: Docusaurus → Fumadocs
 *
 * 1. Clean frontmatter (remove sidebar_position, sidebar_label, archived, date, tags, meta, socialImage*)
 * 2. Convert Docusaurus admonitions (:::note → > [!NOTE])
 * 3. Generate meta.json from _category_.json + sidebar_position
 * 4. Delete _category_.json files
 *
 * Run: bun scripts/migrate.ts
 */

import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';

const DOCS_DIR = join(import.meta.dirname, '..', 'content', 'docs');

// ─── Helpers ───

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

// ─── 1. Clean Frontmatter ───

const FM_KEYS_TO_REMOVE = [
  'sidebar_position',
  'sidebar_label',
  'archived',
  'date',
  'tags',
  'meta',
  'socialImageTitle',
  'socialImageDescription',
  'draft',
];

function cleanFrontmatter(content: string): string {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return content;

  const fmBlock = fmMatch[1];
  const lines = fmBlock.split('\n');
  const cleaned: string[] = [];
  let skipIndented = false;

  for (const line of lines) {
    const isIndented = line.startsWith('  ') || line.startsWith('\t');

    if (skipIndented) {
      if (isIndented || line.trim() === '') continue;
      skipIndented = false;
    }

    const key = line.match(/^(\w[\w-]*)\s*:/)?.[1];
    if (key && FM_KEYS_TO_REMOVE.includes(key)) {
      // Check if next lines are indented (multi-line value like tags/meta)
      skipIndented = true;
      continue;
    }

    cleaned.push(line);
  }

  // If only title/description remain, keep them
  const remaining = cleaned.filter((l) => l.trim() !== '');
  if (remaining.length === 0) {
    // Remove entire frontmatter if empty
    return content.slice(fmMatch[0].length).replace(/^\n+/, '');
  }

  return `---\n${cleaned.join('\n')}\n---${content.slice(fmMatch[0].length)}`;
}

// ─── 2. Convert Admonitions ───

const ADMONITION_MAP: Record<string, string> = {
  note: 'NOTE',
  tip: 'TIP',
  info: 'NOTE',
  caution: 'CAUTION',
  danger: 'CAUTION',
  warning: 'WARNING',
  important: 'IMPORTANT',
};

function convertAdmonitions(content: string): string {
  // Match :::type[optional title]\ncontent\n:::
  return content.replace(
    /^:::(note|tip|info|caution|danger|warning|important)(?:\[([^\]]*)\])?\s*\n([\s\S]*?)^:::\s*$/gm,
    (_match, type: string, title: string | undefined, body: string) => {
      const gfmType = ADMONITION_MAP[type] || 'NOTE';
      const lines = body.trimEnd().split('\n');
      const quoted = lines.map((l) => `> ${l}`).join('\n');
      const header = title
        ? `> [!${gfmType}] ${title}`
        : `> [!${gfmType}]`;
      return `${header}\n${quoted}`;
    },
  );
}

// ─── 3. Generate meta.json ───

interface DocInfo {
  slug: string;
  position: number;
  title?: string;
}

async function generateMetaJson(): Promise<void> {
  const allFiles = await walk(DOCS_DIR);
  const mdFiles = allFiles.filter((f) => /\.(md|mdx)$/.test(f));

  // Group docs by directory
  const dirDocs: Map<string, DocInfo[]> = new Map();

  for (const filePath of mdFiles) {
    const dir = dirname(filePath);
    const content = await readFile(filePath, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);

    let position = 999;
    let title: string | undefined;

    if (fmMatch) {
      const posMatch = fmMatch[1].match(/^sidebar_position:\s*(\d+)/m);
      if (posMatch) position = parseInt(posMatch[1], 10);

      const titleMatch = fmMatch[1].match(/^title:\s*(.+)/m);
      if (titleMatch) title = titleMatch[1].replace(/^["']|["']$/g, '');
    }

    const name = basename(filePath, extname(filePath));
    const slug = name === 'index' ? '...' : name;

    if (!dirDocs.has(dir)) dirDocs.set(dir, []);
    dirDocs.get(dir)!.push({ slug, position, title });
  }

  // Also read _category_.json for directory-level metadata
  const categoryFiles = allFiles.filter((f) => f.endsWith('_category_.json'));
  const categoryData: Map<string, { position: number; label?: string }> = new Map();

  for (const catFile of categoryFiles) {
    const dir = dirname(catFile);
    const data = JSON.parse(await readFile(catFile, 'utf-8'));
    categoryData.set(dir, { position: data.position, label: data.label });
  }

  // Generate meta.json for each directory that has docs
  for (const [dir, docs] of dirDocs.entries()) {
    // Sort by position then alphabetically
    docs.sort((a, b) => a.position - b.position || a.slug.localeCompare(b.slug));

    const meta: {
      title?: string;
      pages: string[];
    } = {
      pages: docs.map((d) => d.slug),
    };

    const cat = categoryData.get(dir);
    if (cat?.label) {
      meta.title = cat.label;
    }

    await writeFile(
      join(dir, 'meta.json'),
      JSON.stringify(meta, null, 2) + '\n',
    );
    console.log(`  Created ${join(dir, 'meta.json')}`);
  }

  // Delete _category_.json files
  for (const catFile of categoryFiles) {
    await unlink(catFile);
    console.log(`  Deleted ${catFile}`);
  }
}

// ─── Main ───

async function main() {
  console.log('=== Cadence Docs Migration ===\n');

  // Step 1 & 2: Process all MD/MDX files
  const allFiles = await walk(DOCS_DIR);
  const mdFiles = allFiles.filter((f) => /\.(md|mdx)$/.test(f));
  console.log(`Found ${mdFiles.length} doc files\n`);

  let admonitionCount = 0;
  let fmCount = 0;

  for (const filePath of mdFiles) {
    let content = await readFile(filePath, 'utf-8');
    const original = content;

    // Count admonitions before conversion
    const admonitions = content.match(/^:::(note|tip|info|caution|danger|warning|important)/gm);
    if (admonitions) admonitionCount += admonitions.length;

    // Clean frontmatter
    content = cleanFrontmatter(content);

    // Convert admonitions
    content = convertAdmonitions(content);

    if (content !== original) {
      await writeFile(filePath, content);
      fmCount++;
      console.log(`  Processed: ${filePath.replace(DOCS_DIR, 'content/docs')}`);
    }
  }

  console.log(`\nCleaned frontmatter in ${fmCount} files`);
  console.log(`Converted ${admonitionCount} admonitions\n`);

  // Step 3 & 4: Generate meta.json and delete _category_.json
  console.log('Generating meta.json files...');
  await generateMetaJson();

  console.log('\n=== Migration complete! ===');
}

main().catch(console.error);
