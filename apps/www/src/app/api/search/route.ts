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

const getSearchMarkdown = async (page: SearchPage) => {
  try {
    return await page.data.getText('processed');
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes('includeProcessedMarkdown')
    ) {
      throw error;
    }

    return page.data.getText('raw');
  }
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

export const { GET } = createFromSource(searchSource as typeof source, {
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
