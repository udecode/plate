import * as React from 'react';

import type { Metadata } from 'next';

import { cn } from '@udecode/cn';
import { notFound } from 'next/navigation';

import { getAllBlockIds } from '@/lib/blocks';
import { getRegistryComponent, getRegistryItem } from '@/lib/registry';
import { styles } from '@/registry/registry-styles';

const getCachedRegistryItem = React.cache(async (name: string) => {
  return await getRegistryItem(name, true);
});

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
  const description = `npx shadcx@latest add ${item.name}`;

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
  const blockIds = await getAllBlockIds();

  return styles.flatMap((style) =>
    blockIds.map((name) => ({
      name,
      style: style.name,
    }))
  );
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
        item.meta?.containerClassName
      )}
    >
      <Component />
    </div>
  );
}
