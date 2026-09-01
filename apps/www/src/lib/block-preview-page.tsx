import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { getAllBlocks } from '@/lib/blocks';
import { getRegistryComponent } from '@/lib/registry-component';
import { getRegistryInstallCommand } from '@/lib/registry-install';
import { getRegistryItem } from '@/lib/rehype-utils';
import { cn } from '@/lib/utils';

const getCachedRegistryItem = React.cache(
  async (name: string) => await getRegistryItem(name, true)
);

export async function generateBlockPreviewMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;

  const item = await getCachedRegistryItem(name);

  if (!item) {
    return {};
  }

  const title = item.description ? item.description : '';
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

export function generateBlockPreviewStaticParams() {
  const blocks = getAllBlocks();

  return blocks.map(({ name }) => ({
    name,
  }));
}

export function BlockPreviewPage(props: { params: Promise<{ name: string }> }) {
  return (
    <React.Suspense fallback={null}>
      <BlockPreviewPageContent {...props} />
    </React.Suspense>
  );
}

async function BlockPreviewPageContent({
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
      {React.createElement(Component, { id: name.replace('-demo', '') })}
    </div>
  );
}
