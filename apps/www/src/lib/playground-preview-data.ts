import type { RegistryItem } from 'shadcn/schema';

import type { FileTree } from './rehype-utils';

import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedRegistryItem,
} from './registry-cache';

export type PlaygroundPreviewData = {
  dependencies: string[];
  highlightedFiles: NonNullable<RegistryItem['files']>;
  item: RegistryItem;
  tree: FileTree[] | null;
};

export async function getPlaygroundPreviewData(): Promise<PlaygroundPreviewData | null> {
  const item = await getCachedRegistryItem('editor-ai', true);

  if (!item?.files) {
    return null;
  }

  const [tree, dependencies] = await Promise.all([
    getCachedFileTree(item.files),
    getCachedDependencies(item.name),
  ]);

  return {
    dependencies,
    highlightedFiles: item.files,
    item,
    tree,
  };
}
