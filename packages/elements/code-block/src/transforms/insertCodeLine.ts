import { insertNodes, PlateEditor, TElement } from '@udecode/plate-core';
import { getCodeLineType } from '../options';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = (editor: PlateEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertNodes<TElement>(editor, {
      type: getCodeLineType(editor),
      children: [{ text: indent }],
    });
  }
};
