import type { SidebarNavItem } from '@/types/nav';
import type { Registry, RegistryItem } from 'shadcn/registry';

import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { rimraf } from 'rimraf';

import { docsConfig } from '../src/config/docs';

const HOMEPAGE = 'https://platejs.org';
const NAME = 'plate';

const isDev = process.env.NODE_ENV === 'development';
const REGISTRY_URL = isDev ? 'http://localhost:3000/rd' : `${HOMEPAGE}/r`;
const SOURCE_DIR = path.join(process.cwd(), 'src/registry/docs');
const TARGET_FILE = 'registry-docs.json';
const TARGET_DIR = isDev ? 'public/rd' : 'public/r';
const TARGET = `${TARGET_DIR}/${TARGET_FILE}`;

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
  rimraf.sync(path.join(process.cwd(), TARGET));

  // Build the complete path map from navigation structure
  buildPathMap(docsConfig.sidebarNav);

  const files = await getFiles(SOURCE_DIR);

  // Transform sidebarNav into fumadocs structure
  const docsStructure = transformNavToFumadocs(docsConfig.sidebarNav);

  // Create meta.json content
  const metaContent = {
    description: 'Rich-text editor framework',
    pages: Object.keys(docsStructure),
    root: true,
    title: NAME.charAt(0).toUpperCase() + NAME.slice(1),
  };

  // Generate all meta files recursively
  const metaFiles = generateMetaFiles(docsConfig.sidebarNav);

  const docsMetaJson: RegistryItem = {
    description: 'Rich-text editor framework',
    files: [
      {
        content: JSON.stringify(metaContent, null, 2),
        path: `docs/content/docs/${NAME}/meta.json`,
        target: `docs/content/docs/${NAME}/meta.json`,
        type: 'registry:file' as const,
      },
      // Add all meta.json files recursively
      ...metaFiles.map((file) => ({
        content: file.content,
        path: file.path,
        target: file.target,
        type: 'registry:file' as const,
      })),
    ],
    name: 'docs-meta',
    title: 'Fumadocs Meta',
    type: 'registry:file',
  };

  const items = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(SOURCE_DIR, filePath);
      const pathWithoutExt = relativePath.replace('.mdx', '');

      const name = `docs-${pathWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;

      const { description, title } = await getFrontmatter(filePath);

      // Get the target path based on the navigation hierarchy
      let targetPath: string;
      if (pathWithoutExt === 'index') {
        targetPath = `docs/content/docs/${NAME}/get-started/index.mdx`;
      } else {
        const section = pathMap.get(pathWithoutExt);
        if (section) {
          const fileName = path.basename(pathWithoutExt);
          // If the filename matches the last part of the section path, use index.mdx
          const lastSection = section.split('/').pop()!;
          const finalFileName = fileName === lastSection ? 'index' : fileName;
          targetPath = `docs/content/docs/${NAME}/${section}/${finalFileName}.mdx`;
        } else {
          // Default fallback if no mapping found
          targetPath = `docs/content/docs/${NAME}/${pathWithoutExt}.mdx`;
        }
      }

      return {
        description:
          description || `Documentation for ${title || pathToTitle(filePath)}`,
        files: [
          {
            path: `src/registry/docs/${relativePath}`,
            target: targetPath,
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
    homepage: HOMEPAGE,
    items: [
      {
        description: `All documentation files for ${NAME}`,
        files: [],
        name: 'docs',
        registryDependencies: [
          `${REGISTRY_URL}/docs-meta`,
          ...items.map((item) => `${REGISTRY_URL}/${item.name}`),
        ],
        title: 'Documentation',
        type: 'registry:file',
      },
      ...items,
    ],
    name: `${NAME}-docs`,
  };

  const docsJson = JSON.stringify(registry, null, 2);

  const docsTargetDir = path.dirname(path.join(process.cwd(), TARGET));
  await fs.mkdir(docsTargetDir, { recursive: true });
  await fs.writeFile(path.join(process.cwd(), TARGET), docsJson);

  await fs.writeFile(
    path.join(TARGET_DIR, 'docs-meta.json'),
    JSON.stringify(docsMetaJson, null, 2)
  );
}

// (optional) Ordering from docs.ts

// Store the complete path hierarchy for each href
const pathMap = new Map<string, string>();

function buildPathMap(nav: SidebarNavItem[], parentTitle?: string) {
  nav.forEach((item) => {
    if (!item.title) return;

    const currentTitle = item.title.toLowerCase().replace(/\s+/g, '-');
    const fullTitle = parentTitle
      ? `${parentTitle}/${currentTitle}`
      : currentTitle;

    // Special case for root /docs path
    if (item.href === '/docs') {
      pathMap.set('index', 'get-started');
      return;
    }

    // Map this item's href if it has one
    if (item.href) {
      const href = item.href.replace(/^\/docs\//, '');
      pathMap.set(href, fullTitle);
    }

    // If this item has subitems, process them with the current title as parent
    if (item.items) {
      item.items.forEach((subItem) => {
        if (!subItem.href) return;

        const href = subItem.href.replace(/^\/docs\//, '');

        // If subItem has its own items, it's a parent
        if (subItem.items) {
          const subTitle =
            subItem.title?.toLowerCase().replace(/\s+/g, '-') ??
            path.basename(href);
          pathMap.set(href, `${fullTitle}/${subTitle}`);

          // Process its children
          subItem.items.forEach((nestedItem) => {
            if (!nestedItem.href) return;
            const nestedHref = nestedItem.href.replace(/^\/docs\//, '');
            pathMap.set(nestedHref, `${fullTitle}/${subTitle}`);
          });
        } else {
          // Regular subitem
          pathMap.set(href, fullTitle);
        }
      });
    }
  });
}

function transformNavToFumadocs(
  nav: SidebarNavItem[]
): Record<string, { pages: string[]; title: string }> {
  const result: Record<string, { pages: string[]; title: string }> = {};

  nav.forEach((item) => {
    if (!item.items || !item.title) return;

    const folderName = item.title.toLowerCase().replace(/\s+/g, '-');

    result[folderName] = {
      pages: item.items.map((subItem) => {
        if (!subItem.href) return 'index';
        const pagePath = subItem.href.split('/').pop();
        return pagePath === folderName ? 'index' : pagePath || 'index';
      }),
      title: item.title,
    };
  });

  return result;
}

function generateMetaFiles(
  nav: SidebarNavItem[],
  parentPath = ''
): { content: string; path: string; target: string }[] {
  const files: { content: string; path: string; target: string }[] = [];

  nav.forEach((item) => {
    if (!item.title) return;

    const currentPath = parentPath
      ? `${parentPath}/${item.title.toLowerCase().replace(/\s+/g, '-')}`
      : item.title.toLowerCase().replace(/\s+/g, '-');

    if (item.items) {
      // Add meta.json for this section
      const content = {
        pages: item.items.map((subItem) => {
          if (!subItem.href) return 'index';
          // Get the last part of the href
          const parts = subItem.href.split('/');
          const lastPart = parts.at(-1);
          return lastPart === currentPath ? 'index' : lastPart;
        }),
        title: item.title,
      };

      files.push({
        content: JSON.stringify(content, null, 2),
        path: `docs/content/docs/${NAME}/${currentPath}/meta.json`,
        target: `docs/content/docs/${NAME}/${currentPath}/meta.json`,
      });

      // Process nested items that have their own subitems
      item.items.forEach((subItem) => {
        if (subItem.items && subItem.title) {
          const subPath = `${currentPath}/${subItem.title.toLowerCase().replace(/\s+/g, '-')}`;
          const subContent = {
            pages: subItem.items.map((nestedItem) => {
              if (!nestedItem.href) return 'index';
              const parts = nestedItem.href.split('/');
              return parts.at(-1);
            }),
            title: subItem.title,
          };

          files.push({
            content: JSON.stringify(subContent, null, 2),
            path: `docs/content/docs/${NAME}/${subPath}/meta.json`,
            target: `docs/content/docs/${NAME}/${subPath}/meta.json`,
          });
        }
      });
    }
  });

  return files;
}
