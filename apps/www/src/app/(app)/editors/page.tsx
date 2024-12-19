import * as React from 'react';

import { BlockDisplay } from '@/components/block-display';
import { siteConfig } from '@/config/site';
import { getAllBlockIds } from '@/lib/blocks';

const block = {
  description: 'A Notion-like AI template',
  descriptionSrc: siteConfig.links.potionTemplate,
  isPro: true,
  meta: {
    iframeHeight: 800,
  },
  name: 'potion',
  src: siteConfig.links.potionIframe,
};

export default async function BlocksPage() {
  const blocks = await getAllBlockIds();

  return (
    <div className="gap-3 md:flex md:flex-row-reverse md:items-start">
      <div className="grid flex-1 gap-12 md:gap-24 lg:gap-48">
        {blocks.map((name) => (
          <BlockDisplay name={name} key={name} />
        ))}

        <div className="relative scroll-m-16 pb-48">
          <BlockDisplay {...block} />
        </div>
      </div>
    </div>
  );
}
