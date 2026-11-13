import { promises as fs } from 'node:fs';
import path from 'node:path';

import { getTableOfContents } from 'fumadocs-core/content/toc';
import matter from 'gray-matter';

import {
  apiItemAnchor,
  apiListAnchor,
  apiReferenceAnchor,
} from '@/lib/docs-anchors';
import { registryExampleSlug, sourcePathToDocsRoute } from '@/lib/docs-routes';
import { getRegistryMetadata } from '@/lib/registry-metadata';
import { hrefWithLocale } from '@/lib/withLocale';
import { registryExamples } from '@/registry/registry-examples';
import type { SidebarNavItem } from '@/types/nav';

const DOCS_HREF_REGEX = /^\/docs(?:\/|$)/;
const CN_DOCS_PREFIX_REGEX = /^\/cn(?=\/docs)/;
const CJK_REGEX = /\p{Script=Han}/u;
const HASH_OR_QUERY_REGEX = /[#?].*$/;
const META_PAGE_HREF_REGEX = /\]\(([^)]+)\)$/;
const TRAILING_SLASH_REGEX = /\/$/;
const CONTENT_DIR = path.join(process.cwd(), '../../content/docs');
const META_FILE = path.join(CONTENT_DIR, 'meta.json');
const SOURCE_FILES = [
  path.join(process.cwd(), '.source/index.ts'),
  path.join(process.cwd(), '.source/server.ts'),
];
const SOURCE_INFO_PATH_REGEX = /info: {"path":"([^"]+)"/g;
const SOURCE_SERVER_DOC_PATH_REGEX = /"([^"]+\.mdx)":\s*__fd_glob_\d+/g;
const PACKAGE_INSTALL_COMMAND_REGEX =
  /^\s*(?:npm\s+(?:i|install)|pnpm\s+(?:add|install)|yarn\s+(?:add|install)|bun\s+(?:add|install))\s+(.+)$/u;
const PACKAGE_IMPORT_REGEX =
  /\b(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"]((?:platejs|plitejs)(?:\/[^'"]+)?)['"]/gu;
const DOCS_ANCHOR_LINK_REGEX = /\]\(((?:\/cn)?\/docs[^\s#)]*)?#([^\s)]+)\)/g;
const CODE_FENCE_REGEX = /^\s*(?:```|~~~)/;
const API_TAG_REGEX = /<(\/?)(API[A-Za-z]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const JSX_STRING_ATTRIBUTE_REGEX = /\b(\w+)=(?:"([^"]*)"|'([^']*)')/g;
const API_LIST_TYPES: Record<string, string> = {
  APIAttributes: 'attributes',
  APIListAPI: 'api',
  APIMethods: 'methods',
  APIOptions: 'options',
  APIParameters: 'parameters',
  APIProps: 'props',
  APIReturns: 'returns',
  APIState: 'state',
  APITransforms: 'transforms',
};
const registry = getRegistryMetadata();

const appOnlyDocsRoutes = new Set([
  '/docs/api',
  '/docs/components',
  '/docs/examples',
  '/docs/examples/server-side',
  '/docs/examples/html-export',
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

async function getMdxFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getMdxFiles(fullPath)));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function getPackageSpecifiers(packageName: 'platejs' | 'plitejs') {
  const manifest = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), `../../packages/${packageName}/package.json`),
      'utf-8'
    )
  ) as { exports: Record<string, unknown> };

  return new Set(
    Object.keys(manifest.exports).map((subpath) =>
      subpath === '.' ? packageName : `${packageName}${subpath.slice(1)}`
    )
  );
}

async function checkPackageDocs() {
  const packageSpecifiers = new Set([
    ...(await getPackageSpecifiers('platejs')),
    ...(await getPackageSpecifiers('plitejs')),
  ]);
  const errors: string[] = [];

  for (const filePath of await getMdxFiles(CONTENT_DIR)) {
    const source = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(CONTENT_DIR, filePath);
    const lines = source.split('\n');

    for (const [index, line] of lines.entries()) {
      const installArguments = line.match(PACKAGE_INSTALL_COMMAND_REGEX)?.[1];

      if (installArguments) {
        const packageTokens = installArguments
          .split(/\s+/u)
          .filter((token) => !token.startsWith('-'));
        const invalidSubpaths = packageTokens.filter((token) =>
          /^(?:platejs|plitejs)\//u.test(token)
        );

        if (invalidSubpaths.length > 0) {
          errors.push(
            `${relativePath}:${index + 1}: install package roots, then import ${invalidSubpaths.join(', ')} as subpaths`
          );
        }

        for (const packageName of ['platejs', 'plitejs']) {
          if (
            packageTokens.filter((token) => token === packageName).length > 1
          ) {
            errors.push(
              `${relativePath}:${index + 1}: installs ${packageName} more than once`
            );
          }
        }
      }
    }

    if (!relativePath.startsWith(`migration${path.sep}`)) {
      if (source.includes('@platejs/*')) {
        errors.push(
          `${relativePath}: teaches the retired @platejs/* namespace`
        );
      }
      if (source.includes('@udecode/')) {
        errors.push(
          `${relativePath}: teaches the retired @udecode/* namespace`
        );
      }
    }

    for (const match of source.matchAll(PACKAGE_IMPORT_REGEX)) {
      if (!packageSpecifiers.has(match[1])) {
        errors.push(
          `${relativePath}: imports unknown package subpath ${match[1]}`
        );
      }
    }
  }

  assert(
    errors.length === 0,
    `Package documentation is stale:\n${errors.map((error) => `- ${error}`).join('\n')}`
  );
}

function withoutCodeFences(lines: string[]) {
  let fenced = false;

  return lines.map((line) => {
    if (CODE_FENCE_REGEX.test(line)) {
      fenced = !fenced;
      return '';
    }

    return fenced ? '' : line;
  });
}

function getJsxStringAttributes(attributes: string) {
  return new Map(
    [...attributes.matchAll(JSX_STRING_ATTRIBUTE_REGEX)].map((match) => [
      match[1],
      match[2] ?? match[3],
    ])
  );
}

function getDocsAnchors(source: string) {
  const { content } = matter(source);
  const anchors = new Set(
    getTableOfContents(content).map((item) => item.url.slice(1))
  );
  const apiNames: string[] = [];
  const listTypes: string[] = [];
  const markup = withoutCodeFences(content.split('\n')).join('\n');

  for (const [tag, closing, name, rawAttributes] of markup.matchAll(
    API_TAG_REGEX
  )) {
    const attributes = getJsxStringAttributes(rawAttributes);
    const selfClosing = tag.endsWith('/>');
    const listType =
      name === 'APIList'
        ? (attributes.get('listType') ?? 'parameters')
        : API_LIST_TYPES[name];
    const apiName = apiNames.at(-1);

    if (closing) {
      if (name === 'API') apiNames.pop();
      else if (listType) listTypes.pop();
    } else if (name === 'API') {
      if (!selfClosing) apiNames.push(attributes.get('name') ?? '');
    } else if (listType) {
      if (apiName) anchors.add(apiListAnchor(apiName, listType));
      if (!selfClosing) listTypes.push(listType);
    } else if (name === 'APIItem' && apiName) {
      anchors.add(
        apiItemAnchor(apiName, listTypes.at(-1), attributes.get('name') ?? '')
      );
    } else if (name === 'APISubListItem' && apiName) {
      anchors.add(
        apiItemAnchor(
          apiName,
          listTypes.at(-1),
          attributes.get('parent') ?? '',
          attributes.get('name') ?? ''
        )
      );
    } else if (name === 'APIReference') {
      anchors.add(
        apiReferenceAnchor(
          attributes.get('package') ?? '',
          attributes.get('symbol') ?? ''
        )
      );
    }
  }

  return anchors;
}

async function checkDocsAnchors(sourcePaths: string[]) {
  const sourcePathByRoute = new Map(
    sourcePaths.map((sourcePath) => [
      sourcePathToDocsRoute(sourcePath),
      sourcePath,
    ])
  );
  const sources = new Map(
    await Promise.all(
      sourcePaths.map(
        async (sourcePath) =>
          [
            sourcePath,
            await fs.readFile(path.join(CONTENT_DIR, sourcePath), 'utf-8'),
          ] as const
      )
    )
  );
  const anchorsBySourcePath = new Map(
    [...sources].map(([sourcePath, source]) => [
      sourcePath,
      getDocsAnchors(source),
    ])
  );
  const resolveRouteWithEnglishFallback = (route: string) =>
    sourcePathByRoute.get(route) ??
    sourcePathByRoute.get(route.replace(CN_DOCS_PREFIX_REGEX, ''));
  const errors: string[] = [];

  for (const [sourcePath, source] of sources) {
    const lines = withoutCodeFences(source.split('\n'));

    for (const [index, line] of lines.entries()) {
      for (const [, href = '', encodedAnchor] of line.matchAll(
        DOCS_ANCHOR_LINK_REGEX
      )) {
        const link = `${href}#${encodedAnchor}`;
        const anchor = decodeURIComponent(encodedAnchor);
        const route = normalizeDocsHref(href);
        const targetPath = href
          ? resolveRouteWithEnglishFallback(route)
          : sourcePath;

        if (!targetPath) {
          errors.push(
            `${sourcePath}:${index + 1}: ${link} opens no MDX docs page`
          );
          continue;
        }
        if (anchorsBySourcePath.get(targetPath)?.has(anchor)) continue;

        const cnTwin = sourcePathByRoute.get(hrefWithLocale(route, 'cn'));
        const hint =
          sourcePath.endsWith('.cn.mdx') &&
          DOCS_HREF_REGEX.test(href) &&
          cnTwin &&
          anchorsBySourcePath.get(cnTwin)?.has(anchor)
            ? `; link /cn${link} instead`
            : '';

        errors.push(
          `${sourcePath}:${index + 1}: ${link} has no #${anchor} on ${targetPath}${hint}`
        );
      }
    }
  }

  assert(
    errors.length === 0,
    `Docs links name anchors their target page does not render:\n${errors
      .map((error) => `- ${error}`)
      .join('\n')}`
  );
}

async function getGeneratedSourcePaths() {
  for (const sourceFile of SOURCE_FILES) {
    let source: string;

    try {
      source = await fs.readFile(sourceFile, 'utf-8');
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
  return JSON.parse(await fs.readFile(META_FILE, 'utf-8')) as DocsMeta;
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

function getSourceRoutes(sourcePaths: string[]) {
  return {
    cn: new Set(
      sourcePaths
        .filter((sourcePath) => sourcePath.endsWith('.cn.mdx'))
        .map((sourcePath) => sourcePathToDocsRoute(sourcePath))
    ),
    en: new Set(
      sourcePaths
        .filter((sourcePath) => !sourcePath.endsWith('.cn.mdx'))
        .map((sourcePath) => sourcePathToDocsRoute(sourcePath))
    ),
  };
}

async function getFrontmatterTitle(filePath: string) {
  const source = await fs.readFile(path.join(CONTENT_DIR, filePath), 'utf-8');
  const { data } = matter(source);
  return data.title;
}

function checkNavRoutes(meta: DocsMeta, sourceUrls: Set<string>) {
  const registryFallbackUrls = new Set([
    ...registry.items
      .filter((item) => item.type === 'registry:component')
      .map((item) => `/docs/components/${item.name}`),
    ...registryExamples.map(
      (item) => `/docs/examples/${registryExampleSlug(item.name)}`
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

  const untranslated: string[] = [];

  for (const file of await getMdxFiles(CONTENT_DIR)) {
    if (!file.endsWith('.cn.mdx')) continue;

    const source = await fs.readFile(file, 'utf-8');
    const prose = source
      .split(/^\s*(?:```|~~~).*$/m)
      .filter((_, index) => index % 2 === 0)
      .join('\n');

    if (!CJK_REGEX.test(prose)) {
      untranslated.push(path.relative(CONTENT_DIR, file));
    }
  }

  assert(
    untranslated.length === 0,
    `Expected every .cn.mdx doc to hold Chinese text outside code blocks, so /cn/docs does not serve English as a translation:\n${untranslated.join('\n')}`
  );

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

try {
  const sourcePaths = [...new Set(await getGeneratedSourcePaths())];
  const sourceRoutes = getSourceRoutes(sourcePaths);
  const docsMeta = await readDocsMeta();

  checkDocsMetaOverlay(docsMeta);
  checkNavRoutes(docsMeta, sourceRoutes.en);
  await checkCnAppOnlyDocsRoutes();
  await checkChineseRoutes(sourceRoutes);
  checkChineseFallbackDocRoutes(sourceRoutes);
  checkChinesePagerHrefLookup();
  await checkPackageDocs();
  await checkDocsAnchors(sourcePaths);
  console.info('Docs source parity check passed.');
} catch (error) {
  console.error(error);
  process.exit(1);
}
