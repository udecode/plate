import registry from 'registry';
import { registryItemSchema } from 'shadcn/schema';

const REGISTRY_BLOCK_TYPES = new Set(['registry:block']);

export function getAllBlocks() {
  // Parse and validate the registry items
  const items = registryItemSchema.array().parse(registry.items);

  return items.filter(
    (block) =>
      REGISTRY_BLOCK_TYPES.has(block.type) &&
      block.categories?.includes('Editors')
  );
}
