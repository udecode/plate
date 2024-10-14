import type { Transformer } from '@/src/utils/transformers';

import { SyntaxKind } from 'ts-morph';

export const transformRsc: Transformer = async ({ config, sourceFile }) => {
  if (config.rsc) {
    return sourceFile;
  }

  // Remove "use client" from the top of the file.
  const first = sourceFile.getFirstChildByKind(SyntaxKind.ExpressionStatement);

  if (
    first?.getText() === `"use client"` ||
    first?.getText() === `'use client'`
  ) {
    first.remove();
  }

  return sourceFile;
};
