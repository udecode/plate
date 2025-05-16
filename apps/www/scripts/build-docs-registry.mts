import type { RegistryItem } from 'shadcn/registry';

import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { rimraf } from 'rimraf';

const isDev = process.env.NODE_ENV === 'development';
const url = isDev ? 'http://localhost:3000/rd' : 'https://platejs.org/r';

const DOCS_DIR = path.join(process.cwd(), 'src/registry/docs');
const DOCS_TARGET = isDev
  ? 'public/rd/registry-docs.json'
  : 'public/r/registry-docs.json';

async function getFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getFiles(fullPath);
      } else if (entry.name.endsWith('.mdx')) {
        return [fullPath];
      }
      return [];
    })
  );

  return files.flat();
}

function pathToTitle(filePath: string): string {
  const basename = path.basename(filePath, '.mdx');
  return basename
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function getFrontmatter(filePath: string) {
  const source = await fs.readFile(filePath, 'utf8');
  const { data } = matter(source);
  return {
    description: data.description,
    title: data.title,
  };
}

export async function buildDocsRegistry() {
  rimraf.sync(path.join(process.cwd(), DOCS_TARGET));

  const files = await getFiles(DOCS_DIR);

  const registry = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(DOCS_DIR, filePath);
      const name = `docs-${relativePath
        .replace('.mdx', '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;

      const { description, title } = await getFrontmatter(filePath);

      return {
        description:
          description || `Documentation for ${title || pathToTitle(filePath)}`,
        files: [
          {
            path: `src/registry/docs/${relativePath}`,
            target: `docs/content/docs/${relativePath}`,
            type: 'registry:file',
          },
        ],
        name,
        title: title || pathToTitle(filePath),
        type: 'registry:file',
      } as RegistryItem;
    })
  );

  // Create the main docs item that includes all other items as dependencies
  const docsItem: RegistryItem = {
    description: 'All documentation files for Plate',
    files: [],
    name: 'docs',
    registryDependencies: registry.map((item) => `${url}/${item.name}`),
    title: 'Documentation',
    type: 'registry:file',
  };

  const docsJson = JSON.stringify(
    {
      homepage: 'https://platejs.org',
      items: [docsItem, ...registry],
      name: 'plate-docs',
    },
    null,
    2
  );

  const docsTargetDir = path.dirname(path.join(process.cwd(), DOCS_TARGET));
  await fs.mkdir(docsTargetDir, { recursive: true });
  await fs.writeFile(path.join(process.cwd(), DOCS_TARGET), docsJson);
}
