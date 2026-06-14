import { describe, expect, it } from 'bun:test';

const { GET, generateStaticParams } = await import('./route');

describe('/registry/changelog/[event].json', () => {
  it('serves a registry changelog event by JSON filename', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({
        event: '2026-06-14-editor-install-kit-files-through.json',
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      id: '2026-06-14-editor-install-kit-files-through',
      release: { status: 'unresolved' },
      change: {
        date: '2026-06-14',
        type: 'source',
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
    const events = generateStaticParams().map((param) => param.event);

    expect(events.length).toBeGreaterThanOrEqual(19);
    expect(events).toContain(
      '2026-06-14-editor-install-kit-files-through.json'
    );
    expect(events).toContain('2026-06-10-attach-column-drop-target-ref.json');
    expect(events).toContain(
      '2026-06-13-show-code-block-language-labels-read-only-mode.json'
    );
    expect(events).toContain('2025-11-20-biome-ultracite.json');
  });
});
