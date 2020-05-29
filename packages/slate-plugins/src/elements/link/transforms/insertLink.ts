import { Editor } from 'slate';
import { LINK } from '../types';
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
