import { insertElements, PlateEditor, Value } from '@udecode/plate-core';
import { getCodeLineType } from '../options';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = <V extends Value>(
  editor: PlateEditor<V>,
  indentDepth = 0
) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertElements(editor, {
      type: getCodeLineType(editor),
      children: [{ text: indent }],
    });
  }
};
