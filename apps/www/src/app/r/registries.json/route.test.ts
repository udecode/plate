import { describe, expect, it } from 'bun:test';

const { GET } = await import('./route');

describe('/r/registries.json', () => {
  it('advertises the Plate-owned shadcn registry', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({
        name: '@plate',
        homepage: 'https://platejs.org',
        url: 'https://platejs.org/r/{style}/{name}.json',
      }),
    ]);
  });
});
