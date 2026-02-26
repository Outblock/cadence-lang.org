import { readdir, readFile, access } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { create, insert, search } from '@orama/orama';

interface DocSource {
  dir: string;
  pathPrefix: string;
}

const DEFAULT_DOCS_DIR =
  process.env.DOCS_DIR || join(import.meta.dirname, '..', '..', 'content', 'docs');

const EXTERNAL_DOCS_DIR = join(import.meta.dirname, '..', '..', 'external', 'onflow-docs', 'docs');

async function dirExists(dir: string): Promise<boolean> {
  try {
    await access(dir);
    return true;
  } catch {
    return false;
  }
}

async function getDocSources(): Promise<DocSource[]> {
  const sources: DocSource[] = [];

  if (await dirExists(DEFAULT_DOCS_DIR)) {
    sources.push({ dir: DEFAULT_DOCS_DIR, pathPrefix: '/docs' });
  }

  if (await dirExists(EXTERNAL_DOCS_DIR)) {
    sources.push({ dir: EXTERNAL_DOCS_DIR, pathPrefix: '/flow-docs' });
  }

  const extraDir = process.env.EXTRA_DOCS_DIR;
  if (extraDir && (await dirExists(extraDir))) {
    const extraPrefix = process.env.EXTRA_DOCS_PREFIX || '/extra-docs';
    sources.push({ dir: extraDir, pathPrefix: extraPrefix });
  }

  return sources;
}

let _docsAvailable: boolean | null = null;

export async function docsAvailable(): Promise<boolean> {
  if (_docsAvailable !== null) return _docsAvailable;
  const sources = await getDocSources();
  _docsAvailable = sources.length > 0;
  return _docsAvailable;
}

interface DocEntry {
  path: string;
  title: string;
  description: string;
  content: string;
}

const db = await create({
  schema: {
    path: 'string' as const,
    title: 'string' as const,
    description: 'string' as const,
    content: 'string' as const,
  },
});

let indexBuilt = false;
const docsByPath = new Map<string, DocEntry>();

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

async function indexSource(source: DocSource): Promise<DocEntry[]> {
  const files = await walk(source.dir);
  const entries: DocEntry[] = [];

  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const { title, description } = extractFrontmatter(raw);
    const content = stripFrontmatter(raw);
    const rel = file.replace(source.dir, '').replace(/\\/g, '/');
    const name = basename(rel, extname(rel));
    const dir = rel.replace(/\/[^/]+$/, '');
    const docPath = name === 'index' ? `${source.pathPrefix}${dir}` : `${source.pathPrefix}${dir}/${name}`;

    const doc: DocEntry = { path: docPath, title, description, content };
    entries.push(doc);
    docsByPath.set(docPath, doc);
    await insert(db, doc);
  }

  return entries;
}

export async function buildIndex(): Promise<DocEntry[]> {
  if (indexBuilt) {
    const all = await search(db, { term: '', limit: 100000 });
    return all.hits.map((h) => h.document as DocEntry);
  }

  const sources = await getDocSources();
  const allEntries: DocEntry[] = [];

  for (const source of sources) {
    const entries = await indexSource(source);
    allEntries.push(...entries);
  }

  indexBuilt = true;
  return allEntries;
}

export async function searchDocs(query: string, topN = 5): Promise<DocEntry[]> {
  await buildIndex();

  const results = await search(db, {
    term: query,
    limit: topN,
    tolerance: 1,
    boost: { title: 3, description: 2 },
  });

  return results.hits.map((h) => h.document as DocEntry);
}

export async function getDoc(path: string): Promise<DocEntry | null> {
  await buildIndex();
  return docsByPath.get(path) ?? null;
}
