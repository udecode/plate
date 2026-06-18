import type { Page } from '@playwright/test';

import type { OpenExampleOptions } from './types';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3101';
const EXAMPLE_FONT_ROUTES = new WeakSet<Page>();

export const prepareExampleRoute = async (page: Page) => {
  if (EXAMPLE_FONT_ROUTES.has(page)) {
    return;
  }

  EXAMPLE_FONT_ROUTES.add(page);
  await Promise.all([
    page.route('https://fonts.googleapis.com/**', (route) =>
      route.fulfill({
        body: '',
        contentType: 'text/css',
        status: 200,
      })
    ),
    page.route('https://fonts.gstatic.com/**', (route) =>
      route.fulfill({
        body: '',
        contentType: 'font/woff2',
        status: 200,
      })
    ),
  ]);
};

export const getExampleRoute = (
  name: string,
  query: OpenExampleOptions['query']
) => {
  const examplePath = `/examples/${name}`;

  return {
    path: examplePath,
    url: `${baseUrl}${examplePath}${formatExampleQuery(query)}`,
  };
};

const formatExampleQuery = (query: OpenExampleOptions['query']) => {
  if (!query) {
    return '';
  }

  if (typeof query === 'string') {
    return query.startsWith('?') ? query : `?${query}`;
  }

  const params =
    query instanceof URLSearchParams ? query : new URLSearchParams();

  if (!(query instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(query)) {
      if (value == null) {
        continue;
      }

      params.set(key, String(value));
    }
  }

  const serialized = params.toString();

  return serialized ? `?${serialized}` : '';
};
