import { Editor } from 'slate';
import { wrapLink } from './wrapLink';

export const insertLink = (editor: Editor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};
