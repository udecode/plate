import { describe, expect, it } from 'bun:test';
import { registryItemSchema } from 'shadcn/schema';

import {
  buildPlateInitInstructions,
  plateInitRegistryItem,
} from './plate-init';
import {
  PLATE_REGISTRY_NAMESPACE,
  PLATE_REGISTRY_URL,
  plateComponentsJsonConfig,
} from './plate-registry-config';

describe('Plate init bootstrap', () => {
  it('exposes a shadcn registry base item for Plate projects', () => {
    expect(registryItemSchema.parse(plateInitRegistryItem)).toEqual(
      plateInitRegistryItem
    );
    expect(plateInitRegistryItem.type).toBe('registry:base');
    if (plateInitRegistryItem.type !== 'registry:base') {
      throw new Error('Expected Plate init item to be registry:base');
    }
    expect(plateInitRegistryItem.extends).toBe('none');
    expect(plateInitRegistryItem.config?.registries).toEqual({
      [PLATE_REGISTRY_NAMESPACE]: PLATE_REGISTRY_URL,
    });
    expect(plateInitRegistryItem.registryDependencies).toContain(
      '@plate/editor-basic'
    );
  });

  it('keeps the bootstrap components config aligned with Plate templates', () => {
    expect(plateComponentsJsonConfig.registries).toEqual({
      '@plate': 'https://platejs.org/r/{name}.json',
    });
    expect(plateComponentsJsonConfig.aliases.ui).toBe('@/components/ui');
    expect(plateComponentsJsonConfig.iconLibrary).toBe('lucide');
  });

  it('documents the same namespace used by the registry base item', () => {
    const markdown = buildPlateInitInstructions();

    expect(markdown).toContain(
      'npx shadcn@latest init --preset https://platejs.org/init'
    );
    expect(markdown).toContain('"@plate": "https://platejs.org/r/{name}.json"');
    expect(markdown).toContain('npx shadcn@latest add @plate/editor-basic');
  });
});
