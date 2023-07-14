import { insertElements, PlateEditor, Value } from '@udecode/plate-common';

import { getCodeLineType } from '../options/index';

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
