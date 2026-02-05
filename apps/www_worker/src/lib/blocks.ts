'use server';

import registry from 'registry';
import { registryItemSchema } from 'shadcn/registry';
import { z } from 'zod';

// SYNC

// const BLOCKS_WHITELIST_PREFIXES = ['sidebar', 'login'];
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
    // BLOCKS_WHITELIST_PREFIXES.some(
    //   (prefix) =>
    //     block.name.startsWith(prefix) && REGISTRY_BLOCK_TYPES.has(block.type)
    // )
  );
}
