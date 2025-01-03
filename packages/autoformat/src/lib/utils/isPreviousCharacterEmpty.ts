import type { Location } from 'slate';

import { type TEditor, getRangeBefore } from '@udecode/plate-common';

export const isPreviousCharacterEmpty = (editor: TEditor, at: Location) => {
  const range = getRangeBefore(editor, at);

  if (range) {
    const text = editor.api.string(range);

    if (text) {
      const noWhiteSpaceRegex = new RegExp(`\\S+`);

      return !noWhiteSpaceRegex.exec(text);
    }
  }

  return true;
};
