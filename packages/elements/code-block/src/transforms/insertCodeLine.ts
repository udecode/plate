import { insertNodes } from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { ELEMENT_CODE_LINE } from '../defaults';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = (editor: SPEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertNodes<TElement>(editor, {
      type: getSlatePluginType(editor, ELEMENT_CODE_LINE),
      children: [{ text: indent }],
    });
  }
};
