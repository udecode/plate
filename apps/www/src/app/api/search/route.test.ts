import { describe, expect, it } from 'bun:test';

import { GET } from './route';

type SearchResult = {
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
});
