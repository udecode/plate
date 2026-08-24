import * as React from 'react';
import type { RegistryItem } from 'shadcn/schema';

import { BlockViewer } from '@/components/block-viewer';
import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedHighlightedFiles,
  getCachedRegistryItem,
} from '@/lib/registry-cache';

type BlockDisplayProps = {
  item: RegistryItem & {
    meta?: {
      descriptionSrc?: string;
      isPro?: boolean;
      src?: string;
    };
  };
};

export function BlockDisplay(props: BlockDisplayProps) {
  return (
    <React.Suspense fallback={null}>
      <BlockDisplayContent {...props} />
    </React.Suspense>
  );
}

async function BlockDisplayContent({ item: block }: BlockDisplayProps) {
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

  const item = await getCachedRegistryItem(block.name);

  if (!item?.files) {
    return null;
  }

  const tree = getCachedFileTree(item.files);
  const dependencies = getCachedDependencies(block.name);
  const highlightedFiles = await getCachedHighlightedFiles(item.files);

  return (
    <BlockViewer
      dependencies={dependencies}
      highlightedFiles={highlightedFiles}
      item={item}
      tree={tree}
    />
  );
}
