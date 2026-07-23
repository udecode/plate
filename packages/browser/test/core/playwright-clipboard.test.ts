import { describe, expect, test } from 'bun:test';

import { requiresSyntheticHtmlPasteTransport } from '../../src/playwright/clipboard';

describe('Playwright clipboard transport', () => {
  test.each([
    {
      environment: {
        maxTouchPoints: 1,
        userAgent:
          'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 Chrome/136.0.0.0 Mobile Safari/537.36',
      },
      expected: true,
      name: 'mobile Chromium emulation',
    },
    {
      environment: {
        maxTouchPoints: 0,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36',
      },
      expected: false,
      name: 'desktop Chromium',
    },
    {
      environment: {
        maxTouchPoints: 0,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.5 Safari/605.1.15',
      },
      expected: true,
      name: 'WebKit',
    },
  ])('uses the expected transport for $name', ({ environment, expected }) => {
    expect(requiresSyntheticHtmlPasteTransport(environment)).toBe(expected);
  });
});
