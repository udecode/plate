import { withoutNormalizing as withoutNormalizingBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const withoutNormalizing = (
  editor: TEditor,
  fn: () => boolean | void
) => {
  let normalized = false;

  withoutNormalizingBase(editor as any, () => {
    normalized = !!fn();
  });

  return normalized;
};
