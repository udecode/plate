import type { SidebarNavItem } from '@/types/nav';

import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { hrefWithLocale } from '@/lib/withLocale';
import { registryExamples } from '@/registry/registry-examples';
import { registryUI } from '@/registry/registry-ui';

import {
  createDocsRegistry,
  createPublicDocsRegistry,
} from './build-docs-registry.mts';

const DOCS_HREF_REGEX = /^\/docs(?:\/|$)/;
const INSTALLED_DOCS_HREF_REGEX = /^\/docs\/plate(?:\/|$)/;
const CN_DOCS_PREFIX_REGEX = /^\/cn(?=\/docs)/;
const PLATE_REGISTRY_NAMESPACE_PREFIX = '@plate/';
const HASH_OR_QUERY_REGEX = /[#?].*$/;
const META_PAGE_HREF_REGEX = /\]\(([^)]+)\)$/;
const UNSCOPED_DOCS_MARKDOWN_LINK_REGEX =
  /\]\(\/docs(?!\/plate(?:\/|#|\?|\)))(?=\/|#|\?|\))/;
const UNSCOPED_DOCS_HREF_ATTRIBUTE_REGEX =
  /\bhref=(["'])\/docs(?!\/plate(?:\/|#|\?|\1))(?=\/|#|\?|\1)/;
const TRAILING_SLASH_REGEX = /\/$/;
const DEMO_SUFFIX_REGEX = /-demo$/;
const MDX_EXTENSION_REGEX = /\.mdx$/;
const CN_EXTENSION_REGEX = /\.cn$/;
const CONTENT_DIR = path.join(process.cwd(), '../../content/docs');
const META_FILE = path.join(CONTENT_DIR, 'meta.json');
const PLATE_PUBLIC_REGISTRY_BASE_URL = 'https://platejs.org/r';
const SOURCE_FILES = [
  path.join(process.cwd(), '.source/index.ts'),
  path.join(process.cwd(), '.source/server.ts'),
];
const SOURCE_INFO_PATH_REGEX = /info: {"path":"([^"]+)"/g;
const SOURCE_SERVER_DOC_PATH_REGEX = /"([^"]+\.mdx)":\s*__fd_glob_\d+/g;
const ROUTE_GROUP_REGEX = /^\(.+\)$/;

const appOnlyDocsRoutes = new Set([
  '/docs/api',
  '/docs/components',
  '/docs/examples',
  '/docs/examples/server-side',
  '/docs/examples/plite-to-html',
  '/docs/plugins',
]);

type DocsMeta = {
  _plate?: {
    categoryGroups?: Record<string, SidebarNavItem[]>;
    docSections?: SidebarNavItem[];
    items?: Record<
      string,
      {
        label?: string | string[];
        titleCn?: string;
      }
    >;
    sections?: Record<string, string>;
  };
  pages?: string[];
};

function assert(condition: unknown, message: string): asserts condition {
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

function collectMetaPageHrefs(pages: string[] = []) {
  const hrefs = new Set<string>();

  for (const page of pages) {
    const href = page.match(META_PAGE_HREF_REGEX)?.[1];

    if (href && DOCS_HREF_REGEX.test(href)) {
      hrefs.add(normalizeDocsHref(href));
    }
  }

  return hrefs;
}

function collectInstalledDocsRegistryHrefs(meta: DocsMeta) {
  return new Set([
    ...collectMetaPageHrefs(meta.pages),
    ...collectDocsHrefs(meta._plate?.docSections ?? []),
    ...Object.values(meta._plate?.categoryGroups ?? {}).flatMap((items) => [
      ...collectDocsHrefs(items),
    ]),
    ...Object.keys(meta._plate?.items ?? {}).filter((href) =>
      DOCS_HREF_REGEX.test(href)
    ),
  ]);
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
  for (const sourceFile of SOURCE_FILES) {
    let source: string;

    try {
      source = await fs.readFile(sourceFile, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        continue;
      }

      throw error;
    }

    const sourcePaths = [
      ...[...source.matchAll(SOURCE_INFO_PATH_REGEX)].map((match) => match[1]),
      ...[...source.matchAll(SOURCE_SERVER_DOC_PATH_REGEX)].map(
        (match) => match[1]
      ),
    ];

    if (sourcePaths.length > 0) {
      return sourcePaths;
    }
  }

  throw new Error(
    'Expected Fumadocs generated source file to include MDX paths'
  );
}

async function readDocsMeta() {
  return JSON.parse(await fs.readFile(META_FILE, 'utf8')) as DocsMeta;
}

function checkDocsMetaOverlay(meta: DocsMeta) {
  assert(
    meta._plate?.sections?.['Get Started'] === '开始',
    'Expected content/docs/meta.json to carry localized section labels'
  );
  assert(
    collectMetaPageHrefs(meta.pages).has('/docs/plugin-input-rules'),
    'Expected content/docs/meta.json pages to carry docs routes'
  );
  assert(
    meta._plate?.items?.['/docs/plugin-input-rules']?.label === 'New',
    'Expected content/docs/meta.json to carry nav labels'
  );
  assert(
    meta._plate?.items?.['/docs/plugin-shortcuts']?.titleCn === '插件快捷键',
    'Expected content/docs/meta.json to carry localized item labels'
  );
  assert(
    meta._plate?.docSections?.[0]?.items?.some(
      (item) => item.value === 'component' && item.href === '/docs/components'
    ),
    'Expected content/docs/meta.json to carry docs category switcher metadata'
  );
  assert(
    meta._plate?.categoryGroups?.component?.some(
      (group) => group.href === '/docs/components'
    ),
    'Expected content/docs/meta.json to carry component category groups'
  );
  assert(
    meta._plate?.categoryGroups?.plugin?.some((group) =>
      collectDocsHrefs([group]).has('/docs/table')
    ),
    'Expected content/docs/meta.json to carry plugin category groups'
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

function checkNavRoutes(meta: DocsMeta, sourceUrls: Set<string>) {
  const registryFallbackUrls = new Set([
    ...registryUI.map((item) => `/docs/components/${item.name}`),
    ...registryExamples.map(
      (item) => `/docs/examples/${item.name.replace(DEMO_SUFFIX_REGEX, '')}`
    ),
  ]);

  const missing = [...collectMetaPageHrefs(meta.pages)]
    .filter((href) => !appOnlyDocsRoutes.has(href))
    .filter((href) => !registryFallbackUrls.has(href))
    .filter((href) => !sourceUrls.has(href));

  assert(
    missing.length === 0,
    `content/docs/meta.json contains routes missing from Fumadocs source or registry fallback:\n${missing
      .map((href) => `- ${href}`)
      .join('\n')}`
  );
}

async function checkCnAppOnlyDocsRoutes() {
  for (const route of appOnlyDocsRoutes) {
    const routePath =
      route === '/docs'
        ? 'page.tsx'
        : `${route.replace('/docs/', '')}/page.tsx`;
    const pagePath = path.join(process.cwd(), 'src/app/cn/docs', routePath);

    try {
      await fs.stat(pagePath);
    } catch {
      throw new Error(`Expected CN app-only docs route to exist: ${pagePath}`);
    }
  }
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

function checkChineseFallbackDocRoutes(sourceRoutes: {
  cn: Set<string>;
  en: Set<string>;
}) {
  const cnRouteParams = new Set([
    ...sourceRoutes.cn,
    ...[...sourceRoutes.en].map((route) => hrefWithLocale(route, 'cn')),
  ]);

  assert(
    cnRouteParams.has('/cn/docs/plugin-input-rules'),
    'Expected CN static params to include English-only docs fallback routes'
  );
}

function checkChinesePagerHrefLookup() {
  const lookupHref = '/cn/docs/table'.replace(CN_DOCS_PREFIX_REGEX, '');

  assert(
    lookupHref === '/docs/table',
    'Expected CN pager lookup href to match Fumadocs page tree URLs'
  );
}

async function checkDocsRegistry() {
  const docsRegistry = await createDocsRegistry();
  const publicDocsRegistry = createPublicDocsRegistry(
    docsRegistry,
    PLATE_PUBLIC_REGISTRY_BASE_URL
  );
  const itemsByName = new Map(
    docsRegistry.items.map((item) => [item.name, item])
  );
  const publicItemsByName = new Map(
    publicDocsRegistry.items.map((item) => [item.name, item])
  );

  assert(itemsByName.has('docs'), 'Expected registry docs aggregate item');
  assert(itemsByName.has('docs-meta'), 'Expected registry docs meta item');
  assert(itemsByName.has('fumadocs'), 'Expected registry fumadocs item');
  assert(itemsByName.has('table-docs'), 'Expected table docs registry item');

  const docsItem = itemsByName.get('docs');
  assert(
    docsItem?.registryDependencies?.includes('@plate/docs-meta'),
    'Expected docs aggregate item to depend on namespaced docs-meta registry item'
  );
  assert(
    docsItem?.registryDependencies?.includes('@plate/table-docs'),
    'Expected docs aggregate item to depend on namespaced table-docs registry item'
  );
  assert(
    docsItem?.registryDependencies?.every((dependency) =>
      dependency.startsWith(PLATE_REGISTRY_NAMESPACE_PREFIX)
    ),
    'Expected docs aggregate dependencies to use Plate namespace specifiers'
  );

  const fumadocsItem = itemsByName.get('fumadocs');
  assert(
    fumadocsItem?.registryDependencies?.includes('@plate/docs'),
    'Expected fumadocs item to depend on namespaced docs registry item'
  );

  const publicFumadocsItem = publicItemsByName.get('fumadocs');
  assert(
    publicFumadocsItem?.registryDependencies?.includes(
      `${PLATE_PUBLIC_REGISTRY_BASE_URL}/docs.json`
    ),
    'Expected public fumadocs item to use same-base docs URL dependency'
  );

  const publicDocsItem = publicItemsByName.get('docs');
  assert(
    publicDocsItem?.registryDependencies?.every(
      (dependency) =>
        typeof dependency === 'string' &&
        dependency.startsWith(`${PLATE_PUBLIC_REGISTRY_BASE_URL}/`) &&
        dependency.endsWith('.json')
    ),
    'Expected public docs aggregate dependencies to use same-base URL specifiers'
  );

  const docsMeta = itemsByName.get('docs-meta');
  const docsMetaFile = docsMeta?.files?.find(
    (file) =>
      typeof file !== 'string' &&
      file.path === '../../content/docs/meta.json' &&
      file.target === 'content/docs/plate/meta.json'
  );

  assert(docsMetaFile, 'Expected docs-meta to publish Fumadocs meta.json');

  if (typeof docsMetaFile !== 'string') {
    assert(
      docsMetaFile.content,
      'Expected docs-meta to inline rewritten Fumadocs meta.json content'
    );

    const installedDocsMeta = JSON.parse(docsMetaFile.content!) as DocsMeta;
    const misplacedHrefs = [
      ...collectInstalledDocsRegistryHrefs(installedDocsMeta),
    ].filter((href) => !INSTALLED_DOCS_HREF_REGEX.test(href));

    assert(
      misplacedHrefs.length === 0,
      `Expected installed docs meta hrefs to stay under /docs/plate:\n${misplacedHrefs
        .map((href) => `- ${href}`)
        .join('\n')}`
    );
  }

  const tableDocs = itemsByName.get('table-docs');
  assert(
    tableDocs?.files?.some(
      (file) =>
        typeof file !== 'string' &&
        file.path === '../../content/docs/(plugins)/(elements)/table.mdx'
    ),
    'Expected table-docs to publish the source table MDX file'
  );

  const docsMdxFiles = docsRegistry.items.flatMap(
    (item) =>
      item.files?.filter(
        (file) =>
          typeof file !== 'string' &&
          file.target?.startsWith('content/docs/plate/') &&
          file.target.endsWith('.mdx')
      ) ?? []
  );
  const docsMdxFilesWithRootLinks = docsMdxFiles.filter(
    (file) =>
      typeof file !== 'string' &&
      (!file.content ||
        UNSCOPED_DOCS_MARKDOWN_LINK_REGEX.test(file.content) ||
        UNSCOPED_DOCS_HREF_ATTRIBUTE_REGEX.test(file.content))
  );

  assert(
    docsMdxFilesWithRootLinks.length === 0,
    `Expected installed docs MDX files to inline content with /docs/plate links:\n${docsMdxFilesWithRootLinks
      .map((file) => (typeof file === 'string' ? file : `- ${file.target}`))
      .join('\n')}`
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
  const docsMeta = await readDocsMeta();

  checkDocsMetaOverlay(docsMeta);
  checkNavRoutes(docsMeta, sourceRoutes.en);
  await checkCnAppOnlyDocsRoutes();
  await checkChineseRoutes(sourceRoutes);
  checkChineseFallbackDocRoutes(sourceRoutes);
  checkChinesePagerHrefLookup();
  await checkDocsRegistry();
  console.info('Docs source parity check passed.');
} catch (error) {
  console.error(error);
  process.exit(1);
}
