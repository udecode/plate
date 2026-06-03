import { describe, expect, it } from 'bun:test';

const { GET } = await import('./route');

describe('/registry/changelog/index.json', () => {
  it('serves the public registry changelog index', async () => {
    const response = GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schemaVersion).toBe(1);
    expect(data.events).toHaveLength(3);
    expect(data.events[0]).toMatchObject({
      href: '/registry/changelog/2026-06-03-show-code-block-language-labels-read-only-mode.json',
      id: '2026-06-03-show-code-block-language-labels-read-only-mode',
      release: { status: 'unreleased' },
    });
  });
});
