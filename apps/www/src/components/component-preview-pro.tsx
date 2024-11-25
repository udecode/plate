'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';

import { BlockViewer } from '@/components/block-viewer';
import { Markdown } from '@/components/markdown';
import { siteConfig } from '@/config/site';

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
      className={cn('relative my-4 flex flex-col space-y-2', className)}
      {...props}
    >
      {description && <Markdown>{description}</Markdown>}

      <BlockViewer
        block={false}
        dependencies={[]}
        highlightedFiles={[]}
        item={
          {
            name: id,
            src: `${siteConfig.links.plateProIframe}/${id}`,
          } as any
        }
        tree={[]}
        isPro
      />
    </div>
  );
}
