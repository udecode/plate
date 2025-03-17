import * as React from 'react';

import { BlockViewer } from '@/components/block-viewer';
import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedHighlightedFiles,
  getCachedRegistryItem,
} from '@/lib/registry-cache';

export async function BlockDisplay({
  isPro,
  name,
  src,
  ...props
}: {
  name: string;
  isPro?: boolean;
  src?: string;
}) {
  if (src) {
    return (
      <BlockViewer
        dependencies={[]}
        highlightedFiles={[]}
        isPro={isPro}
        item={
          {
            name,
            src,
            ...props,
          } as any
        }
        tree={[]}
      />
    );
  }

  const item = await getCachedRegistryItem(name, true);

  if (!item?.files) {
    return null;
  }

  const [tree, highlightedFiles, dependencies] = await Promise.all([
    getCachedFileTree(item.files),
    getCachedHighlightedFiles(item.files),
    getCachedDependencies(name),
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
