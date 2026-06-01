'use client';

import type { ComponentProps } from 'react';
import * as React from 'react';

import type { PlaygroundPreviewData } from '@/lib/playground-preview-data';

import { useLocale } from '@/hooks/useLocale';
import PlaygroundDemo from '@/registry/examples/playground-demo';

import { BlockViewer } from './block-viewer';

const i18n = {
  cn: {
    description: 'AI 编辑器',
  },
  en: {
    description: 'An AI editor',
  },
};

const HOME_PREVIEW_HEIGHT = 780;

export function PlaygroundPreview({
  className,
  dependencies,
  highlightedFiles,
  item,
  tree,
  ...props
}: ComponentProps<'div'> & PlaygroundPreviewData) {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
  const previewItem = React.useMemo(
    () => ({
      ...item,
      description: content.description,
      meta: {
        ...item.meta,
        iframeHeight: HOME_PREVIEW_HEIGHT,
      },
    }),
    [content.description, item]
  );

  return (
    <div className={className} {...props}>
      <BlockViewer
        dependencies={dependencies}
        highlightedFiles={highlightedFiles as any}
        item={previewItem as any}
        preview={({ iframeKey }) => (
          <div
            key={iframeKey}
            className="themes-wrapper chunk-mode relative z-20 size-full bg-background"
          >
            <PlaygroundDemo className="h-full" />
          </div>
        )}
        tree={tree}
      />
    </div>
  );
}
