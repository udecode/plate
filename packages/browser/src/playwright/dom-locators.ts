import type { Locator } from '@playwright/test';

import type { SurfaceTarget } from './surface';
import type { EditorSurfaceOptions } from './types';

export const getEditable = (
  surface: SurfaceTarget,
  options: EditorSurfaceOptions = {}
) => {
  const scopeSelector = options.scope ?? (options.frame ? 'body' : undefined);
  const scope = scopeSelector ? surface.locator(scopeSelector) : surface;

  return scope.getByRole('textbox').first();
};

export const locateBlock = (root: Locator, path: number[]) => {
  if (path.length === 0) {
    throw new Error('Block path cannot be empty');
  }

  let locator = root
    .locator(':scope > [data-plite-node="element"]')
    .nth(path[0]!);

  for (const segment of path.slice(1)) {
    locator = locator
      .locator(':scope > [data-plite-node="element"]')
      .nth(segment);
  }

  return locator;
};

export const locateText = (root: Locator, path: number[]) => {
  if (path.length === 0) {
    throw new Error('Text path cannot be empty');
  }

  const textIndex = path.at(-1)!;
  const parentPath = path.slice(0, -1);
  const parent = parentPath.length > 0 ? locateBlock(root, parentPath) : root;

  return parent.locator('[data-plite-node="text"]').nth(textIndex);
};
