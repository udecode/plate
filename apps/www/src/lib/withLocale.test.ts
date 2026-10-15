import { describe, expect, it } from 'bun:test';

import { hrefWithLocale } from './withLocale';

describe('hrefWithLocale', () => {
  it('prefixes /cn only on the routes the Chinese site serves', () => {
    const hrefs = [
      '/',
      '/docs',
      '/docs/plite',
      '/editors',
      '/examples/plite/richtext',
      '/cn/docs',
    ];

    const localized: string[] = hrefs.map((href) => hrefWithLocale(href, 'cn'));

    expect(localized).toEqual([
      '/cn',
      '/cn/docs',
      '/cn/docs/plite',
      '/editors',
      '/examples/plite/richtext',
      '/cn/docs',
    ]);
  });
});
