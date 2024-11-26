import * as React from 'react';

import type { Metadata } from 'next';

import { cn } from '@udecode/cn';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/absoluteUrl';
import { getAllBlockIds } from '@/lib/blocks';
import { getRegistryComponent, getRegistryItem } from '@/lib/registry';
import { styles } from '@/registry/registry-styles';

import '@/styles/mdx.css';

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

  const title = item.name;
  const description = item.description;

  return {
    description,
    openGraph: {
      description,
      images: [
        {
          alt: siteConfig.name,
          height: 630,
          url: siteConfig.ogImage,
          width: 1200,
        },
      ],
      title,
      type: 'article',
      url: absoluteUrl(`/blocks/${item.name}`),
    },
    title: `${item.name}${item.description ? ` - ${item.description}` : ''}`,
    twitter: {
      card: 'summary_large_image',
      creator: '@shadcn',
      description,
      images: [siteConfig.ogImage],
      title,
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
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className={cn(
        'themes-wrapper bg-background [&_[data-block-hide]]:hidden',
        item.meta?.containerClassName
      )}
    >
      <Component />
    </div>
  );
}
