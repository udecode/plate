'use client';

import * as React from 'react';

import { BlockViewer } from '@/components/block-viewer';
import { Markdown } from '@/components/markdown';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  description?: string;
  name?: string;
}

export function ComponentPreviewPro({
  id,
  children,
  className,
  description,
  name,
  ...props
}: ComponentPreviewProps) {
  if (!id && name) {
    id = name?.replace('-pro', '');
  }

  return (
    <div
      className={cn('relative mt-4 mb-12 flex flex-col space-y-2', className)}
      {...props}
    >
      {description && <Markdown>{description}</Markdown>}

      <BlockViewer
        block={false}
        dependencies={[]}
        highlightedFiles={[]}
        item={{
          meta: {
            descriptionSrc: siteConfig.links.plateProExample(id),
            isPro: true,
            src: `${siteConfig.links.plateProIframe}/${id}`,
          },
          name: id,
          type: 'registry:example',
        }}
        tree={[]}
      />
    </div>
  );
}
