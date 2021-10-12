import { EditorNodesOptions } from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import { setIndent } from './setIndent';

export const indent = (editor: TEditor, options: EditorNodesOptions = {}) => {
  setIndent(editor, { offset: 1, ...options });
};
