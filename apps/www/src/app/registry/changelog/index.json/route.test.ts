import { describe, expect, it } from 'bun:test';

import type { RegistryChangelogIndex } from '@/lib/registry-changelog';

const { GET } = await import('./route');

describe('/registry/changelog/index.json', () => {
  it('serves the public registry changelog index', async () => {
    const response = GET();
    const data = (await response.json()) as RegistryChangelogIndex;

    expect(response.status).toBe(200);
    expect(data.schemaVersion).toBe(1);
    expect(data.events.length).toBeGreaterThanOrEqual(19);
    expect(data.events[0]).toMatchObject({
      href: '/registry/changelog/2026-06-14-editor-install-kit-files-through.json',
      id: '2026-06-14-editor-install-kit-files-through',
      release: { status: 'unresolved' },
      change: {
        date: '2026-06-14',
        type: 'source',
      },
    });
    expect(data.events.map((event) => event.id)).toContain(
      '2025-10-17-fix-react-decouple'
    );
  });
});
