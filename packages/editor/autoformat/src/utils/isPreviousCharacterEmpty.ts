import { getRangeBefore, getText, TEditor } from '@udecode/plate-core';
import { Location } from 'slate';

export const isPreviousCharacterEmpty = (editor: TEditor, at: Location) => {
  const range = getRangeBefore(editor, at);
  if (range) {
    const text = getText(editor, range);
    if (text) {
      const noWhiteSpaceRegex = new RegExp(`\\S+`);

      return !text.match(noWhiteSpaceRegex);
    }
  }

  return true;
};
