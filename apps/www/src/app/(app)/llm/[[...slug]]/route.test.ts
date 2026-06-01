import { describe, expect, it } from 'bun:test';

import { GET } from './route';

describe('LLM markdown route', () => {
  it('accepts markdown-suffixed route params', async () => {
    const response = await GET(
      new Request('https://platejs.org/docs/installation/mcp.md') as any,
      {
        params: Promise.resolve({ slug: ['installation', 'mcp.md'] }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain(
      'Source: https://platejs.org/docs/installation/mcp'
    );
  });
});
