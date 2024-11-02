import type { Metadata } from 'next';

import { cn } from '@udecode/cn';
import { notFound } from 'next/navigation';

import { BlockChunk } from '@/components/block-chunk';
import { BlockWrapper } from '@/components/block-wrapper';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/absoluteUrl';
import { getAllBlockIds, getBlock } from '@/lib/blocks';
import { type Style, styles } from '@/registry/registry-styles';

import '@/styles/mdx.css';

export async function generateMetadata({
  params,
}: {
  params: {
    name: string;
    style: Style['name'];
  };
}): Promise<Metadata> {
  const { name, style } = params;
  console.log('name', name, style);
  const block = await getBlock(name, style);

  if (!block) {
    return {};
  }

  const title = block.name;
  const description = block.description;

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
      url: absoluteUrl(`/blocks/${block.name}`),
    },
    title: `${block.description} - ${block.name}`,
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
  params: {
    name: string;
    style: Style['name'];
  };
}) {
  const { name, style } = params;
  const block = await getBlock(name, style);

  if (!block) {
    return notFound();
  }

  const Component = block.component;

  const chunks = block.chunks?.map((chunk) => ({ ...chunk }));
  delete block.component;
  block.chunks?.map((chunk) => delete chunk.component);

  return (
    <>
      {/* <ThemesStyle /> */}
      <div
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={cn(
          'themes-wrapper bg-background',
          block.container?.className
        )}
      >
        <BlockWrapper block={block}>
          <Component />
          {chunks?.map((chunk, index) => (
            <BlockChunk
              key={chunk.name}
              block={block}
              chunk={block.chunks?.[index]}
            >
              <chunk.component />
            </BlockChunk>
          ))}
        </BlockWrapper>
      </div>
    </>
  );
}
