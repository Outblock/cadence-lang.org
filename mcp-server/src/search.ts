import { readdir, readFile, access } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const DOCS_DIR =
  process.env.DOCS_DIR || join(import.meta.dirname, '..', '..', 'content', 'docs');

let _docsAvailable: boolean | null = null;

export async function docsAvailable(): Promise<boolean> {
  if (_docsAvailable !== null) return _docsAvailable;
  try {
    await access(DOCS_DIR);
    _docsAvailable = true;
  } catch {
    _docsAvailable = false;
  }
  return _docsAvailable;
}

interface DocEntry {
  path: string;
  title: string;
  description: string;
  content: string;
}

let indexCache: DocEntry[] | null = null;

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

function extractFrontmatter(content: string): { title: string; description: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { title: '', description: '' };
  const fm = match[1];
  const title = fm.match(/^title:\s*(.+)/m)?.[1]?.replace(/^["']|["']$/g, '') || '';
  const description = fm.match(/^description:\s*(.+)/m)?.[1]?.replace(/^["']|["']$/g, '') || '';
  return { title, description };
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}

export async function buildIndex(): Promise<DocEntry[]> {
  if (indexCache) return indexCache;

  const files = await walk(DOCS_DIR);
  const entries: DocEntry[] = [];

  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const { title, description } = extractFrontmatter(raw);
    const content = stripFrontmatter(raw);
    const rel = file.replace(DOCS_DIR, '').replace(/\\/g, '/');
    const name = basename(rel, extname(rel));
    const dir = rel.replace(/\/[^/]+$/, '');
    const docPath = name === 'index' ? `/docs${dir}` : `/docs${dir}/${name}`;

    entries.push({ path: docPath, title, description, content });
  }

  indexCache = entries;
  return entries;
}

export async function searchDocs(query: string, topN = 5): Promise<DocEntry[]> {
  const index = await buildIndex();
  const terms = query.toLowerCase().split(/\s+/);

  const scored = index.map((doc) => {
    const text = `${doc.title} ${doc.description} ${doc.content}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (doc.title.toLowerCase().includes(term)) score += 10;
      if (doc.description.toLowerCase().includes(term)) score += 5;
      const matches = text.split(term).length - 1;
      score += Math.min(matches, 20);
    }
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.doc);
}

export async function getDoc(path: string): Promise<DocEntry | null> {
  const index = await buildIndex();
  return index.find((d) => d.path === path) || null;
}
