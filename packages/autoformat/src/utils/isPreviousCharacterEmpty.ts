import {
  TEditor,
  Value,
  getEditorString,
  getRangeBefore,
} from '@udecode/plate-common';
import { Location } from 'slate';

export const isPreviousCharacterEmpty = <V extends Value>(
  editor: TEditor<V>,
  at: Location
) => {
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
