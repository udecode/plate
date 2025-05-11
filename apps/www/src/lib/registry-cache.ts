import * as React from 'react';

import type { registryItemFileSchema } from 'shadcn/registry';
import type { z } from 'zod';

import { highlightFiles } from './highlight-code';
import {
  createFileTreeForRegistryItemFiles,
  getAllDependencies,
  getRegistryItem,
} from './rehype-utils';

export const getCachedRegistryItem = React.cache(
  async (name: string, prefetch = false) => {
    return await getRegistryItem(name, prefetch);
  }
);

export const getCachedFileTree = React.cache(
  (files: { path: string; target?: string }[]) => {
    return createFileTreeForRegistryItemFiles(files);
  }
);

export const getCachedHighlightedFiles = React.cache(
  (files: z.infer<typeof registryItemFileSchema>[]) => {
    return highlightFiles(files);
  }
);

export const getCachedDependencies = React.cache((name: string) => {
  return getAllDependencies(name);
});
