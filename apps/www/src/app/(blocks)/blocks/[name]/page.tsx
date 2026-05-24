import * as React from 'react';

import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { getAllBlocks } from '@/lib/blocks';
import { getRegistryInstallCommand } from '@/lib/registry-install';
import { getRegistryComponent } from '@/lib/registry-component';
import { getRegistryItem } from '@/lib/rehype-utils';
import { cn } from '@/lib/utils';

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
  const description = getRegistryInstallCommand(item.name);

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
  const Component = getRegistryComponent(name);

  if (!item || !Component) {
    return notFound();
  }

  return (
    <div
      className={cn(
        'themes-wrapper bg-background **:data-block-hide:hidden',
        item.meta?.containerClassName ?? 'size-full'
      )}
    >
      {/* eslint-disable-next-line react-hooks/static-components -- Dynamic block component loading is intentional */}
      <Component id={name.replace('-demo', '')} />
    </div>
  );
}
