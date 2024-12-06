import type { Decorate } from '@udecode/plate-common/react';

import { annotationsToDecorations, isEditor } from '@udecode/plate-common';

import type { LintConfig } from './lint-plugin';

export const decorateLint: Decorate<LintConfig> = (ctx) => {
  const {
    editor,
    entry: [node],
    getOptions,
  } = ctx;
  const { annotations } = getOptions();

  // Support only blocks for now
  if (!isEditor(node)) {
    return [];
  }

  return annotationsToDecorations(editor, { annotations: annotations }).flatMap(
    (decoration) => ({
      ...decoration,
      lint: true,
    })
  );
};
