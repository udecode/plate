import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ELEMENT_CODE_LINE } from '../defaults';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = (editor: SPEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    Transforms.insertNodes(editor, {
      type: getPluginType(editor, ELEMENT_CODE_LINE),
      children: [{ text: indent }],
    } as any);
  }
};
