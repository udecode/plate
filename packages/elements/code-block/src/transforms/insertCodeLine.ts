import { insertNodes } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../defaults';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = (editor: SPEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertNodes<TElement>(editor, {
      type: getPlatePluginType(editor, ELEMENT_CODE_LINE),
      children: [{ text: indent }],
    });
  }
};
