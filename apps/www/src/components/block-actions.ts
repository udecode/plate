'use server';

import * as React from 'react';

import { highlightFiles } from '@/lib/highlight-code';
import { getRegistryItem } from '@/lib/registry';

const getCachedRegistryItem = React.cache(async (name: string) => {
  return await getRegistryItem(name);
});

const getCachedHighlightedFiles = React.cache(async (files: any[]) => {
  return await highlightFiles(files);
});

export async function getHighlightedFiles(name: string) {
  const item = await getCachedRegistryItem(name);

  if (!item?.files) return null;

  return getCachedHighlightedFiles(item.files);
}
