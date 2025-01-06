import type { Editor } from '@udecode/plate-common';
import type { Location } from 'slate';

export const isPreviousCharacterEmpty = (editor: Editor, at: Location) => {
  const range = editor.api.range('before', at);

  if (range) {
    const text = editor.api.string(range);

    if (text) {
      const noWhiteSpaceRegex = new RegExp(`\\S+`);

      return !noWhiteSpaceRegex.exec(text);
    }
  }

  return true;
};
