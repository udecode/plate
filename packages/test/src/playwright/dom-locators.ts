import type { Locator } from '@playwright/test';

import { getDefined } from '../internal/getDefined';
import type { SurfaceTarget } from './surface';
import type { EditorSurfaceOptions } from './types';

/** Locate the first editor root for a Playwright page or frame surface. */
export const getBrowserEditable = (
  surface: SurfaceTarget,
  options: EditorSurfaceOptions = {}
) => {
  const scopeSelector = options.scope ?? (options.frame ? 'body' : undefined);
  const scope = scopeSelector ? surface.locator(scopeSelector) : surface;

  return scope.getByRole('textbox').first();
};

/** Locate a rendered block element by editor model path. */
export const locateBrowserBlock = (root: Locator, path: number[]) => {
  if (path.length === 0) {
    throw new Error('Block path cannot be empty');
  }

  let locator = root
    .locator(':scope > [data-editor-node="element"]')
    .nth(path[0]);

  for (const segment of path.slice(1)) {
    locator = locator
      .locator(':scope > [data-editor-node="element"]')
      .nth(segment);
  }

  return locator;
};

/** Locate a rendered text element by editor model path. */
export const locateBrowserText = (root: Locator, path: number[]) => {
  if (path.length === 0) {
    throw new Error('Text path cannot be empty');
  }

  const textIndex = getDefined(path.at(-1));
  const parentPath = path.slice(0, -1);
  const parent =
    parentPath.length > 0 ? locateBrowserBlock(root, parentPath) : root;

  return parent.locator('[data-editor-node="text"]').nth(textIndex);
};
