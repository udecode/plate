import { insertNodes } from '@udecode/plate-common';
import { SPEditor, TElement } from '@udecode/plate-core';
import { getCodeLineType } from '../options';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = (editor: SPEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertNodes<TElement>(editor, {
      type: getCodeLineType(editor),
      children: [{ text: indent }],
    });
  }
};
