import * as React from 'react';

import type { RegistryItem } from 'shadcn/registry';

import { BlockDisplay } from '@/components/block-display';
import { siteConfig } from '@/config/site';
import { getAllBlocks } from '@/lib/blocks';

// SYNC

const potionBlock: RegistryItem = {
  description: 'A Notion-like AI template',
  meta: {
    descriptionSrc: siteConfig.links.potionTemplate,
    iframeHeight: 800,
    isPro: true,
    src: siteConfig.links.potionIframe,
  },
  name: 'potion',
  type: 'registry:block',
};

export default async function BlocksPage() {
  const blocks = await getAllBlocks();

  return (
    <div className="gap-3 md:flex md:flex-row-reverse md:items-start">
      <div className="grid flex-1 gap-12 md:gap-24 lg:gap-48">
        {blocks.map((block) => (
          <BlockDisplay key={block.name} item={block} />
        ))}

        <div className="relative scroll-m-16 pb-48">
          <BlockDisplay item={potionBlock} />
        </div>
      </div>
    </div>
  );
}
