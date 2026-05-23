import type { SidebarNavItem } from '@/types/nav';

import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { docsConfig } from '@/config/docs';
import { registryExamples } from '@/registry/registry-examples';
import { registryUI } from '@/registry/registry-ui';

import { createDocsRegistry } from './build-docs-registry.mts';

const DOCS_HREF_REGEX = /^\/docs(?:\/|$)/;
const HASH_OR_QUERY_REGEX = /[#?].*$/;
const TRAILING_SLASH_REGEX = /\/$/;
const DEMO_SUFFIX_REGEX = /-demo$/;
const MDX_EXTENSION_REGEX = /\.mdx$/;
const CN_EXTENSION_REGEX = /\.cn$/;
const CONTENT_DIR = path.join(process.cwd(), '../../content');
const SOURCE_INDEX = path.join(process.cwd(), '.source/index.ts');
const SOURCE_INFO_PATH_REGEX = /info: {"path":"([^"]+)"/g;
const ROUTE_GROUP_REGEX = /^\(.+\)$/;

const appOnlyDocsRoutes = new Set([
  '/docs/api',
  '/docs/components',
  '/docs/examples',
  '/docs/examples/server-side',
  '/docs/examples/slate-to-html',
  '/docs/plugins',
]);

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeDocsHref(href: string) {
  return (
    href.replace(HASH_OR_QUERY_REGEX, '').replace(TRAILING_SLASH_REGEX, '') ||
    '/docs'
  );
}

function collectDocsHrefs(items: SidebarNavItem[], hrefs = new Set<string>()) {
  for (const item of items) {
    if (item.href && !item.external && DOCS_HREF_REGEX.test(item.href)) {
      hrefs.add(normalizeDocsHref(item.href));
    }

    if (item.items) {
      collectDocsHrefs(item.items, hrefs);
    }
  }

  return hrefs;
}

async function countCnMdxFiles(dir: string): Promise<number> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      count += await countCnMdxFiles(fullPath);
    } else if (entry.name.endsWith('.cn.mdx')) {
      count += 1;
    }
  }

  return count;
}

async function getGeneratedSourcePaths() {
  const sourceIndex = await fs.readFile(SOURCE_INDEX, 'utf8');
  return [...sourceIndex.matchAll(SOURCE_INFO_PATH_REGEX)].map(
    (match) => match[1]
  );
}

function sourcePathToDocsRoute(sourcePath: string, locale: 'cn' | 'en') {
  const pathWithoutExtension = sourcePath
    .replace(MDX_EXTENSION_REGEX, '')
    .replace(CN_EXTENSION_REGEX, '');
  const routeParts = pathWithoutExtension
    .split('/')
    .filter((part) => !ROUTE_GROUP_REGEX.test(part));

  if (routeParts.at(-1) === 'index') {
    routeParts.pop();
  }

  const prefix = locale === 'cn' ? '/cn/docs' : '/docs';
  return routeParts.length > 0 ? `${prefix}/${routeParts.join('/')}` : prefix;
}

function getSourceRoutes(sourcePaths: string[]) {
  return {
    cn: new Set(
      sourcePaths
        .filter((sourcePath) => sourcePath.endsWith('.cn.mdx'))
        .map((sourcePath) => sourcePathToDocsRoute(sourcePath, 'cn'))
    ),
    en: new Set(
      sourcePaths
        .filter((sourcePath) => !sourcePath.endsWith('.cn.mdx'))
        .map((sourcePath) => sourcePathToDocsRoute(sourcePath, 'en'))
    ),
  };
}

async function getFrontmatterTitle(filePath: string) {
  const source = await fs.readFile(path.join(CONTENT_DIR, filePath), 'utf8');
  const { data } = matter(source);
  return data.title;
}

function checkNavRoutes(sourceUrls: Set<string>) {
  const registryFallbackUrls = new Set([
    ...registryUI.map((item) => `/docs/components/${item.name}`),
    ...registryExamples.map(
      (item) => `/docs/examples/${item.name.replace(DEMO_SUFFIX_REGEX, '')}`
    ),
  ]);

  const missing = [...collectDocsHrefs(docsConfig.sidebarNav)]
    .filter((href) => !appOnlyDocsRoutes.has(href))
    .filter((href) => !registryFallbackUrls.has(href))
    .filter((href) => !sourceUrls.has(href));

  assert(
    missing.length === 0,
    `docsConfig contains routes missing from Fumadocs source or registry fallback:\n${missing
      .map((href) => `- ${href}`)
      .join('\n')}`
  );
}

async function checkChineseRoutes(sourceRoutes: {
  cn: Set<string>;
  en: Set<string>;
}) {
  const cnMdxCount = await countCnMdxFiles(CONTENT_DIR);

  assert(cnMdxCount > 0, 'Expected translated .cn.mdx docs to exist');

  assert(
    sourceRoutes.cn.has('/cn/docs/table'),
    'Expected /cn/docs/table to resolve from translated MDX'
  );
  assert(
    (await getFrontmatterTitle('(plugins)/(elements)/table.cn.mdx')) === '表格',
    'Expected the translated table MDX frontmatter title to be Chinese'
  );

  assert(
    sourceRoutes.en.has('/docs/plugin-input-rules'),
    'Expected plugin-input-rules English source to exist for CN fallback'
  );
  assert(
    !sourceRoutes.cn.has('/cn/docs/plugin-input-rules'),
    'Expected plugin-input-rules to exercise the missing-translation fallback path'
  );
}

async function checkDocsRegistry() {
  const docsRegistry = await createDocsRegistry();
  const itemsByName = new Map(
    docsRegistry.items.map((item) => [item.name, item])
  );

  assert(itemsByName.has('docs'), 'Expected registry docs aggregate item');
  assert(itemsByName.has('fumadocs'), 'Expected registry fumadocs item');
  assert(itemsByName.has('table-docs'), 'Expected table docs registry item');

  const docsItem = itemsByName.get('docs');
  assert(
    docsItem?.registryDependencies?.some((dependency) =>
      dependency.endsWith('/table-docs')
    ),
    'Expected docs aggregate item to depend on table-docs'
  );

  const tableDocs = itemsByName.get('table-docs');
  assert(
    tableDocs?.files?.some(
      (file) =>
        typeof file !== 'string' &&
        file.path === '../../content/(plugins)/(elements)/table.mdx'
    ),
    'Expected table-docs to publish the source table MDX file'
  );

  const translatedFiles = docsRegistry.items.flatMap(
    (item) =>
      item.files?.filter(
        (file) => typeof file !== 'string' && file.path.endsWith('.cn.mdx')
      ) ?? []
  );

  assert(
    translatedFiles.length === 0,
    'Expected docs registry export to skip translated .cn.mdx files'
  );
}

try {
  const sourceRoutes = getSourceRoutes(await getGeneratedSourcePaths());

  checkNavRoutes(sourceRoutes.en);
  await checkChineseRoutes(sourceRoutes);
  await checkDocsRegistry();
  console.info('Docs source parity check passed.');
} catch (error) {
  console.error(error);
  process.exit(1);
}
