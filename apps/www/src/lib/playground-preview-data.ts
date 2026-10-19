import { cacheLife } from 'next/cache';
import type { RegistryItem } from 'shadcn/schema';

import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedRegistryItem,
} from './registry-cache';
import type { FileTree } from './rehype-utils';

export type PlaygroundPreviewData = {
  dependencies: string[];
  highlightedFiles: NonNullable<RegistryItem['files']>;
  item: RegistryItem;
  tree: FileTree[] | null;
};

export async function getPlaygroundPreviewData(): Promise<PlaygroundPreviewData | null> {
  'use cache';
  cacheLife('max');

  const item = await getCachedRegistryItem('editor-ai', true);

  if (!item?.files) {
    return null;
  }

  const tree = getCachedFileTree(item.files);
  const dependencies = getCachedDependencies(item.name);

  return {
    dependencies,
    highlightedFiles: item.files,
    item,
    tree,
  };
}
