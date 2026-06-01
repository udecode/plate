import { describe, expect, it } from 'bun:test';

import { GET } from './route';

type SearchResult = {
  content: string;
  section?: 'docsApi';
  url: string;
};

const search = async (query: string, locale: 'cn' | 'en') => {
  const response = await GET(
    new Request(
      `http://localhost/api/search?${new URLSearchParams({ locale, query })}`
    )
  );

  if (response.status !== 200) {
    throw new Error(`Expected search status 200, got ${response.status}`);
  }

  return (await response.json()) as SearchResult[];
};

describe('/api/search', () => {
  it('keeps English search scoped to English docs', async () => {
    const results = await search('controlled', 'en');

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((item) => item.url.startsWith('/docs/controlled'))
    ).toBe(true);
    expect(results.every((item) => !item.url.startsWith('/cn/'))).toBe(true);
  });

  it('keeps CN search scoped to CN docs', async () => {
    const results = await search('Editor', 'cn');

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.url.startsWith('/cn/docs/'))).toBe(true);
    expect(results.every((item) => !item.url.startsWith('/docs/'))).toBe(true);
  });

  it('indexes English fallback docs for CN search', async () => {
    const results = await search('Plugin Input Rules', 'cn');

    expect(
      results.some((item) => item.url.startsWith('/cn/docs/plugin-input-rules'))
    ).toBe(true);
    expect(results.every((item) => !item.url.startsWith('/docs/'))).toBe(true);
  });

  it('indexes API headings inside docs pages', async () => {
    const results = await search('duplicate definitions', 'en');
    const apiHeading = results.find(
      (item) => item.url === '/docs/footnote#apifootnoteduplicatedefinitions'
    );

    expect(apiHeading).toBeDefined();
    expect(apiHeading?.section).toBe('docsApi');
  });

  it('tags transform headings inside docs pages', async () => {
    const results = await search(
      'tf footnote normalizeDuplicateDefinition',
      'en'
    );
    const apiHeading = results.find(
      (item) =>
        item.url === '/docs/footnote#tffootnotenormalizeduplicatedefinition'
    );

    expect(apiHeading).toBeDefined();
    expect(apiHeading?.section).toBe('docsApi');
  });

  it('does not tag normal docs headings as docs API sections', async () => {
    const results = await search('Create your first editor', 'en');
    const normalHeading = results.find(
      (item) => item.url === '/docs/installation/react#create-your-first-editor'
    );

    expect(normalHeading).toBeDefined();
    expect(normalHeading?.section).toBeUndefined();
  });

  it('does not index docs frontmatter as searchable body text', async () => {
    const results = await search('route docs markdown title markdown', 'en');

    expect(
      results.some(
        (item) =>
          item.url === '/docs/footnote' &&
          item.content.includes('route') &&
          item.content.includes('title')
      )
    ).toBe(false);
  });
});
