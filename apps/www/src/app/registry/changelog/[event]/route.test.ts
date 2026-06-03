import { describe, expect, it } from 'bun:test';

const { GET, generateStaticParams } = await import('./route');

describe('/registry/changelog/[event].json', () => {
  it('serves a registry changelog event by JSON filename', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({
        event: '2026-06-03-show-code-block-language-labels-read-only-mode.json',
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      id: '2026-06-03-show-code-block-language-labels-read-only-mode',
      release: { status: 'unreleased' },
      change: {
        pullRequest: {
          number: 4989,
          state: 'OPEN',
        },
      },
    });
  });

  it('returns 404 for unknown changelog events', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ event: 'missing.json' }),
    });

    expect(response.status).toBe(404);
  });

  it('generates static params for event JSON paths', () => {
    expect(generateStaticParams()).toEqual([
      {
        event: '2026-06-03-show-code-block-language-labels-read-only-mode.json',
      },
      { event: '2026-06-02-improve-large-document-editing.json' },
      { event: '2026-04-23-redesign-blockquotes-container-blocks.json' },
    ]);
  });
});
