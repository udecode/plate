import type { Location } from 'slate';

import {
  type TEditor,
  type Value,
  getEditorString,
  getRangeBefore,
} from '@udecode/plate-common/server';

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
