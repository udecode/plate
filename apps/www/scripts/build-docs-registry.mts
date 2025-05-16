import type { SidebarNavItem } from '@/types/nav';
import type { Registry, RegistryItem } from 'shadcn/registry';

import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { rimraf } from 'rimraf';

import { docsConfig } from '../src/config/docs';

const isDev = process.env.NODE_ENV === 'development';
const url = isDev ? 'http://localhost:3000/rd' : 'https://platejs.org/r';

const DOCS_DIR = path.join(process.cwd(), 'src/registry/docs');
const FILE_TARGET = 'registry-docs.json';
const FOLDER_TARGET = isDev ? 'public/rd' : 'public/r';
const TARGET = `${FOLDER_TARGET}/${FILE_TARGET}`;

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

function transformNavToFumadocs(
  nav: SidebarNavItem[]
): Record<string, { pages: string[]; title: string }> {
  const result: Record<string, { pages: string[]; title: string }> = {};

  nav.forEach((item) => {
    if (!item.items || !item.title) return;

    // Convert title to folder name: "Get Started" -> "get-started"
    const folderName = item.title.toLowerCase().replace(/\s+/g, '-');

    result[folderName] = {
      pages: item.items.map((subItem) => {
        // Convert href to page name: "/docs/installation/next" -> "next"
        // or "/docs/installation" -> "index"
        if (!subItem.href) return 'index';
        const pagePath = subItem.href.split('/').pop();
        return pagePath === folderName ? 'index' : pagePath || 'index';
      }),
      title: item.title,
    };
  });

  return result;
}

export async function buildDocsRegistry() {
  rimraf.sync(path.join(process.cwd(), TARGET));

  const files = await getFiles(DOCS_DIR);

  // Transform sidebarNav into fumadocs structure
  const docsStructure = transformNavToFumadocs(docsConfig.sidebarNav);

  // Create meta.json content
  const metaContent = {
    description: 'Rich-text editor framework',
    pages: Object.keys(docsStructure),
    root: true,
    title: 'Plate',
  };

  const docsMetaJson: RegistryItem = {
    description: 'Rich-text editor framework',
    files: [
      {
        content: JSON.stringify(metaContent, null, 2),
        path: 'docs/content/docs/plate/meta.json',
        target: 'docs/content/docs/plate/meta.json',
        type: 'registry:file' as const,
      },
      // Add meta.json for each section
      ...Object.entries(docsStructure).map(([folder, { pages, title }]) => ({
        content: JSON.stringify(
          {
            pages,
            title,
          },
          null,
          2
        ),
        path: `docs/content/docs/plate/${folder}/meta.json`,
        target: `docs/content/docs/plate/${folder}/meta.json`,
        type: 'registry:file' as const,
      })),
    ],
    name: 'docs-meta',
    title: 'Fumadocs Meta',
    type: 'registry:file',
  };

  const items = await Promise.all(
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
            target: `docs/content/docs/plate/${relativePath}`,
            type: 'registry:file',
          },
        ],
        name,
        title: title || pathToTitle(filePath),
        type: 'registry:file',
      } as RegistryItem;
    })
  );

  const registry: Registry = {
    homepage: 'https://platejs.org',
    items: [
      {
        description: 'All documentation files for Plate',
        files: [],
        name: 'docs',
        registryDependencies: [
          `${url}/docs-meta`,
          ...items.map((item) => `${url}/${item.name}`),
        ],
        title: 'Documentation',
        type: 'registry:file',
      },
      ...items,
    ],
    name: 'plate-docs',
  };

  const docsJson = JSON.stringify(registry, null, 2);

  const docsTargetDir = path.dirname(path.join(process.cwd(), TARGET));
  await fs.mkdir(docsTargetDir, { recursive: true });
  await fs.writeFile(path.join(process.cwd(), TARGET), docsJson);

  await fs.writeFile(
    path.join(FOLDER_TARGET, 'docs-meta.json'),
    JSON.stringify(docsMetaJson, null, 2)
  );
}
