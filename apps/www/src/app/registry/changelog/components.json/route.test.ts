import { describe, expect, it } from 'bun:test';

const { GET } = await import('./route');

describe('/registry/changelog/components.json', () => {
  it('serves a component-to-events lookup', async () => {
    const response = GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schemaVersion).toBe(1);
    expect(data.components['code-block-node']).toContain(
      '2026-06-03-show-code-block-language-labels-read-only-mode'
    );
    expect(data.components['huge-document-demo']).toEqual([
      '2026-06-02-improve-large-document-editing',
    ]);
    expect(data.components['suggestion-kit']).toContain(
      '2025-10-21-add-rejectaisuggestions'
    );
  });
});
