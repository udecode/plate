import {
  type Registry,
  type RegistryItem,
  registrySchema,
} from 'shadcn/schema';

import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { rimraf } from 'rimraf';

import { toRegistryDependencySpecifier } from './registry-dependencies.mts';

const HOMEPAGE = 'https://platejs.org';
const NAME = 'plate';

const isDev = process.env.NODE_ENV === 'development';
const RELATIVE_SOURCE_DIR = '../../content/docs';
const SOURCE_DIR = path.join(process.cwd(), RELATIVE_SOURCE_DIR);
const META_FILE = 'meta.json';
const TARGET_FILE = 'registry-docs.json';
const TARGET_DIR = isDev ? 'public/rd' : 'public/r';
const TARGET = `${TARGET_DIR}/${TARGET_FILE}`;

const DIRECTORY_PATTERN_REGEX = /\(([^)]*)\)\//g;

async function getFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getFiles(fullPath);
      }
      if (
        entry.name.endsWith('.mdx') &&
        // Ignore translated docs
        !entry.name.endsWith('.cn.mdx')
      ) {
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

export async function createDocsRegistry(): Promise<Registry> {
  const files = await getFiles(SOURCE_DIR);

  const items = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(SOURCE_DIR, filePath);
      const pathWithoutExt = relativePath.replace('.mdx', '');

      // Match Fumadocs route-group stripping for registry item names.
      const cleanPath = pathWithoutExt.replace(DIRECTORY_PATTERN_REGEX, '');

      const name = `${cleanPath
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-docs`;

      const { description, title } = await getFrontmatter(filePath);

      const targetPath = `content/docs/${NAME}/${pathWithoutExt}.mdx`;

      return {
        description:
          description || `Documentation for ${title || pathToTitle(filePath)}`,
        files: [
          {
            path: `${RELATIVE_SOURCE_DIR}/${relativePath}`,
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

  const docsMetaItem: RegistryItem = {
    description: `Fumadocs metadata for ${NAME} documentation`,
    files: [
      {
        path: `${RELATIVE_SOURCE_DIR}/${META_FILE}`,
        target: `content/docs/${NAME}/${META_FILE}`,
        type: 'registry:file',
      },
    ],
    name: 'docs-meta',
    title: 'Documentation metadata',
    type: 'registry:file',
  };

  return registrySchema.parse({
    homepage: HOMEPAGE,
    items: [
      docsMetaItem,
      {
        description: `All documentation files for ${NAME}`,
        files: [],
        name: 'docs',
        registryDependencies: [docsMetaItem, ...items].map((item) =>
          toRegistryDependencySpecifier(item.name)
        ),
        title: 'Documentation',
        type: 'registry:file',
      },
      {
        dependencies: [
          '@radix-ui/react-separator',
          '@radix-ui/react-accordion',
          'lucide-react',
          'class-variance-authority',
          'tailwind-merge',
          'clsx',
        ],
        description: `Fumadocs app for ${NAME}`,
        files: [
          {
            path: 'src/registry/blocks/fumadocs/content/docs/index.mdx',
            target: 'content/docs/index.mdx',
            type: 'registry:file',
          },
          {
            path: 'src/registry/blocks/fumadocs/fumadocs-mdx-components.tsx',
            target: 'mdx-components.tsx',
            type: 'registry:file',
          },
          {
            path: 'src/registry/blocks/fumadocs/mdx-plate-components.tsx',
            target: 'mdx-plate-components.tsx',
            type: 'registry:file',
          },
        ],
        name: 'fumadocs',
        registryDependencies: [toRegistryDependencySpecifier('docs')],
        title: 'Fumadocs app',
        type: 'registry:file',
      },
      ...items,
    ],
    name: `${NAME}-docs`,
  });
}

export async function buildDocsRegistry() {
  rimraf.sync(path.join(process.cwd(), TARGET));

  const registry = await createDocsRegistry();
  const docsJson = JSON.stringify(registry, null, 2);

  const docsTargetDir = path.dirname(path.join(process.cwd(), TARGET));
  await fs.mkdir(docsTargetDir, { recursive: true });
  await fs.writeFile(path.join(process.cwd(), TARGET), docsJson);

  return registry.items;
}
