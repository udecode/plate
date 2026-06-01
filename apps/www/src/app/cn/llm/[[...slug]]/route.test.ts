import { describe, expect, it } from 'bun:test';

import { GET } from './route';

describe('CN LLM markdown route', () => {
  it('uses the localized URL for English fallback docs', async () => {
    const response = await GET(
      new Request('https://platejs.org/cn/docs/plugin-input-rules.md') as any,
      {
        params: Promise.resolve({ slug: ['plugin-input-rules'] }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain(
      'Source: https://platejs.org/cn/docs/plugin-input-rules'
    );
  });

  it('accepts markdown-suffixed route params', async () => {
    const response = await GET(
      new Request('https://platejs.org/cn/docs/plugin-input-rules.md') as any,
      {
        params: Promise.resolve({ slug: ['plugin-input-rules.md'] }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain(
      'Source: https://platejs.org/cn/docs/plugin-input-rules'
    );
  });
});
