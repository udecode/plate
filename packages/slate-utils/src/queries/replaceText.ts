import type { Range } from 'slate';

import {
  type TEditor,
  deleteText,
  insertText,
  withoutNormalizing,
} from '@udecode/slate';

/** Replace text at a specific range. */
export const replaceText = (
  editor: TEditor,
  {
    at,
    text,
  }: {
    at: Range;
    text: string;
  }
) => {
  withoutNormalizing(editor, () => {
    deleteText(editor, {
      at,
    });
    insertText(editor, text, {
      at: at.anchor,
    });
  });
};
