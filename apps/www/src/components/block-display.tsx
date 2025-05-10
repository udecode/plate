import * as React from 'react';

import type { RegistryItem } from 'shadcn/registry';

import { BlockViewer } from '@/components/block-viewer';
import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedHighlightedFiles,
  getCachedRegistryItem,
} from '@/lib/registry-cache';

export async function BlockDisplay({
  item: block,
}: {
  item: RegistryItem & {
    meta?: {
      descriptionSrc?: string;
      isPro?: boolean;
      src?: string;
    };
  };
}) {
  if (block.meta?.src) {
    return (
      <BlockViewer
        dependencies={[]}
        highlightedFiles={[]}
        item={block}
        tree={[]}
      />
    );
  }

  const item = await getCachedRegistryItem(block.name, true);

  if (!item?.files) {
    return null;
  }

  const [tree, highlightedFiles, dependencies] = await Promise.all([
    getCachedFileTree(item.files),
    getCachedHighlightedFiles(item.files),
    getCachedDependencies(block.name),
  ]);

  return (
    <BlockViewer
      dependencies={dependencies}
      highlightedFiles={highlightedFiles}
      item={item}
      tree={tree}
    />
  );
}
