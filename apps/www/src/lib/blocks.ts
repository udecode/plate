'use server';

import { z } from 'zod';

import { Index } from '@/__registry__';
import { registryItemSchema } from '@/registry/schema';

// const BLOCKS_WHITELIST_PREFIXES = ['sidebar', 'login'];
const REGISTRY_BLOCK_TYPES = new Set(['registry:block']);

// eslint-disable-next-line @typescript-eslint/require-await
export async function getAllBlockIds() {
  const blocks = _getAllBlocks();

  return blocks.map((block) => block.name);
}

function _getAllBlocks() {
  const index = z.record(registryItemSchema).parse(Index.default);

  return Object.values(index).filter(
    (block) =>
      REGISTRY_BLOCK_TYPES.has(block.type) && block.category === 'Editors'
    // BLOCKS_WHITELIST_PREFIXES.some(
    //   (prefix) =>
    //     block.name.startsWith(prefix) && REGISTRY_BLOCK_TYPES.has(block.type)
    // )
  );
}
