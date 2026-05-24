'use server';

import registry from 'registry';
import { registryItemSchema } from 'shadcn/schema';
import { z } from 'zod';

const REGISTRY_BLOCK_TYPES = new Set(['registry:block']);

export async function getAllBlocks() {
  const blocks = _getAllBlocks();

  return blocks;
}

function _getAllBlocks() {
  // Parse and validate the registry items
  const items = z.array(registryItemSchema).parse(registry.items);

  return items.filter(
    (block) =>
      REGISTRY_BLOCK_TYPES.has(block.type) &&
      block.categories?.includes('Editors')
  );
}
