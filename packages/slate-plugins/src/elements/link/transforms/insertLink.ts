import { LINK } from 'elements/link/types';
import { Editor } from 'slate';
import { wrapLink } from './wrapLink';

export const insertLink = (
  editor: Editor,
  url: string,
  { typeLink = LINK } = {}
) => {
  if (editor.selection) {
    wrapLink(editor, url, { typeLink });
  }
};
