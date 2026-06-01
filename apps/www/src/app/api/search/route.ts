import { structure } from 'fumadocs-core/mdx-plugins';
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '@/lib/source';
import { hrefWithLocale } from '@/lib/withLocale';

type SearchPage = ReturnType<typeof source.getPages>[number];
type SearchPageFrontmatter = {
  description?: string;
  title?: string;
};
type SearchResult = {
  section?: 'docsApi';
  url?: string;
};

const MARKDOWN_CODE_TICK_REGEX = /`/g;
const MARKDOWN_HEADING_REGEX = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const MARKDOWN_LINE_BREAK_REGEX = /\r?\n/;
const API_DOCS_PATH_REGEX = /^\/(?:cn\/)?docs\/api(?:\/|$)/;
const API_SECTION_TITLE_REGEX =
  /^api(?:\b|[\s:/-]|接口|参考|方法|组件|路由|和|与)/i;
const API_SECTION_TITLES = new Set([
  'hooks',
  'options',
  'selectors',
  'transforms',
  'types',
  'utilities',
]);

const getSearchMarkdown = async (page: SearchPage) => {
  const raw = await page.data.getText('raw');

  return frontmatter(raw).content;
};

const getSearchFrontmatter = async (page: SearchPage) => {
  const raw = await page.data.getText('raw');
  const { data } = frontmatter(raw);

  return data as SearchPageFrontmatter;
};

const buildSearchIndex = async (page: SearchPage) => {
  const [frontmatterData, markdown] = await Promise.all([
    getSearchFrontmatter(page),
    getSearchMarkdown(page),
  ]);

  return {
    description: page.data.description ?? frontmatterData.description,
    id: page.url,
    structuredData: structure(markdown),
    title:
      page.data.title ?? frontmatterData.title ?? page.slugs.at(-1) ?? page.url,
    url: page.url,
  };
};

const getPageKey = (page: SearchPage) => page.slugs.join('/');

const getPlainHeadingText = (value: string) =>
  value.replace(MARKDOWN_CODE_TICK_REGEX, '').trim();

const getMarkdownHeadings = (markdown: string) => {
  const headings: { depth: number; text: string }[] = [];

  for (const line of markdown.split(MARKDOWN_LINE_BREAK_REGEX)) {
    const match = MARKDOWN_HEADING_REGEX.exec(line);

    if (match) {
      headings.push({
        depth: match[1].length,
        text: match[2],
      });
    }
  }

  return headings;
};

const isDocsApiSectionHeading = (heading: string) => {
  const title = getPlainHeadingText(heading);

  return (
    API_SECTION_TITLE_REGEX.test(title) ||
    API_SECTION_TITLES.has(title.toLowerCase())
  );
};

const searchSource = {
  ...source,
  getPages: ((language?: string) => {
    if (language) {
      return source.getPages(language);
    }

    const pages = source.getPages();
    const cnPageKeys = new Set(source.getPages('cn').map(getPageKey));
    const cnFallbackPages = source
      .getPages('en')
      .filter((page) => !cnPageKeys.has(getPageKey(page)))
      .map((page) => ({
        ...page,
        locale: 'cn' as const,
        url: hrefWithLocale(page.url, 'cn'),
      }));

    return [...pages, ...cnFallbackPages];
  }) as typeof source.getPages,
};

let docsApiAnchorUrlsPromise: Promise<Set<string>> | undefined;

const getDocsApiAnchorUrls = () => {
  docsApiAnchorUrlsPromise ??= collectDocsApiAnchorUrls();

  return docsApiAnchorUrlsPromise;
};

const collectDocsApiAnchorUrls = async () => {
  const urls = new Set<string>();

  await Promise.all(
    searchSource.getPages().map(async (page) => {
      if (API_DOCS_PATH_REGEX.test(page.url)) {
        return;
      }

      const markdown = await getSearchMarkdown(page);
      const structuredData = structure(markdown);
      const markdownHeadings = getMarkdownHeadings(markdown);
      let apiSectionDepth: number | undefined;

      structuredData.headings.forEach((heading, index) => {
        const markdownHeading = markdownHeadings[index];
        const depth = markdownHeading?.depth ?? 2;

        if (apiSectionDepth !== undefined && depth <= apiSectionDepth) {
          apiSectionDepth = undefined;
        }

        if (isDocsApiSectionHeading(markdownHeading?.text ?? heading.content)) {
          apiSectionDepth = depth;
        }

        if (apiSectionDepth !== undefined) {
          urls.add(`${page.url}#${heading.id}`);
        }
      });
    })
  );

  return urls;
};

const { GET: baseGET } = createFromSource(searchSource as typeof source, {
  buildIndex: buildSearchIndex,
  localeMap: {
    cn: 'english',
    en: 'english',
  },
  search: {
    groupBy: {
      maxResult: 4,
      properties: ['page_id'],
    },
    limit: 20,
  },
});

export async function GET(request: Request) {
  const response = await baseGET(request);
  const results = (await response.json()) as unknown;

  if (!Array.isArray(results)) {
    return Response.json(results, { status: response.status });
  }

  const docsApiAnchorUrls = await getDocsApiAnchorUrls();
  const taggedResults = results.map((item: SearchResult) => {
    if (item.url && docsApiAnchorUrls.has(item.url)) {
      return {
        ...item,
        section: 'docsApi' as const,
      };
    }

    return item;
  });

  return Response.json(taggedResults, { status: response.status });
}
