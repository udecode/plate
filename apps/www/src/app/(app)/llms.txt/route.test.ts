import { describe, expect, it } from 'bun:test';

import { GET } from './route';

describe('llms.txt route', () => {
  it('returns the Fumadocs LLM docs index', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');

    const text = await response.text();

    expect(text).toContain('# Docs');
    expect(text).toContain('- **Get Started**');
    expect(text).toContain('[Plate UI](/docs/installation/plate-ui)');
    expect(text).toContain('[MCP](/docs/installation/mcp)');
  });
});
