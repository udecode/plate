import { SyntaxKind } from 'ts-morph';
import { Transformer } from '.';

export const transformRsc: Transformer = async ({ sourceFile, config }) => {
  if (config.rsc) {
    return sourceFile;
  }

  // Remove "use client" from the top of the file.
  const first = sourceFile.getFirstChildByKind(SyntaxKind.ExpressionStatement);
  if (first?.getText() === `"use client"`) {
    first.remove();
  }

  return sourceFile;
};
