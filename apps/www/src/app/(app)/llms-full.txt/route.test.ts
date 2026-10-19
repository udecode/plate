import { describe, expect, it } from 'bun:test';

import { GET } from './route';

describe('llms-full.txt route', () => {
  it('returns concatenated LLM markdown for docs pages', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');

    const text = await response.text();

    expect(text).toContain('# Getting Started');
    expect(text).toContain('Source: https://platejs.org/docs/installation');
    expect(text).toContain('Source: https://platejs.org/docs/installation/mcp');
    expect(text).toContain('## Registry URLs');
  });
});
