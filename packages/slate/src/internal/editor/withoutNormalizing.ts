import { withoutNormalizing as withoutNormalizingBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

export const withoutNormalizing = (
  editor: Editor,
  fn: () => boolean | void
) => {
  let normalized = false;

  withoutNormalizingBase(editor as any, () => {
    normalized = !!fn();
  });

  return normalized;
};
