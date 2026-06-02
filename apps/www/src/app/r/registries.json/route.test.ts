import { describe, expect, it } from 'bun:test';

import {
  PLATE_REGISTRY_DESCRIPTION,
  PLATE_REGISTRY_HOMEPAGE,
  PLATE_REGISTRY_NAMESPACE,
  PLATE_REGISTRY_URL,
  plateRegistryDirectory,
} from '@/lib/plate-registry-config';

const { GET } = await import('./route');

describe('/r/registries.json', () => {
  it('advertises the Plate-owned shadcn registry', async () => {
    const response = GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        name: PLATE_REGISTRY_NAMESPACE,
        homepage: PLATE_REGISTRY_HOMEPAGE,
        url: PLATE_REGISTRY_URL,
        description: PLATE_REGISTRY_DESCRIPTION,
      },
    ]);
    expect(data).toEqual(plateRegistryDirectory);
  });
});
