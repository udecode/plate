import { unstable_cache } from 'next/cache';

import { BlockPreview } from '@/components/block-preview';
import { getBlock } from '@/lib/blocks';

const getBlockByName = unstable_cache(
  async (name: string) => {
    const block = await getBlock(name);

    if (!block) {
      return null;
    }

    return {
      container: block.container,
      description: block.description,
      name: block.name,
      // style: block.style,
      style: 'default',
    };
  },
  ['block']
);

export async function BlockDisplay({ name }: { name: string }) {
  const block = await getBlockByName(name);

  if (!block) {
    return null;
  }

  return <BlockPreview key={block.name} block={block} />;
}
