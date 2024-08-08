import type { Location } from 'slate';

import {
  type TEditor,
  getEditorString,
  getRangeBefore,
} from '@udecode/plate-common/server';

export const isPreviousCharacterEmpty = (editor: TEditor, at: Location) => {
  const range = getRangeBefore(editor, at);

  if (range) {
    const text = getEditorString(editor, range);

    if (text) {
      const noWhiteSpaceRegex = new RegExp(`\\S+`);

      return !text.match(noWhiteSpaceRegex);
    }
  }

  return true;
};
