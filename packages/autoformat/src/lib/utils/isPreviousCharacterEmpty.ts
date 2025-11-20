import type { Editor, TLocation } from 'platejs';

const noWhiteSpaceRegex = /\S+/;

export const isPreviousCharacterEmpty = (editor: Editor, at: TLocation) => {
  const range = editor.api.range('before', at);

  if (range) {
    const text = editor.api.string(range);

    if (text) {
      return !noWhiteSpaceRegex.exec(text);
    }
  }

  return true;
};
