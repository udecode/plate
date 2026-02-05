import * as React from 'react';

import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { getAllBlocks } from '@/lib/blocks';
import { getRegistryItem } from '@/lib/rehype-utils';
import { ClientBlockPage } from '@/components/client-block-page';

const getCachedRegistryItem = React.cache(
  async (name: string) => await getRegistryItem(name, true)
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;

  const item = await getCachedRegistryItem(name);

  if (!item) {
    return {};
  }

  const title = `${item.description ? `${item.description}` : ''}`;
  const description = `npx shadcn@latest add ${siteConfig.registryUrl}${item.name}`;

  return {
    description,
    openGraph: {
      images: [
        {
          url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description ?? '')}`,
        },
      ],
    },
    title,
    twitter: {
      card: 'summary_large_image',
      images: [
        {
          url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description ?? '')}`,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const blocks = await getAllBlocks();

  return blocks.map(({ name }) => ({
    name,
  }));
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = await getCachedRegistryItem(name);

  if (!item) {
    return notFound();
  }

  return (
    <ClientBlockPage
      containerClassName={item.meta?.containerClassName ?? 'size-full'}
      name={name}
    />
  );
}
