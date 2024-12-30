import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const withoutNormalizing = (
  editor: TEditor,
  fn: () => boolean | void
) => {
  let normalized = false;

  Editor.withoutNormalizing(editor as any, () => {
    normalized = !!fn();
  });

  return normalized;
};
