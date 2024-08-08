import { type PlateEditor, insertElements } from '@udecode/plate-common/server';

import { getCodeLineType } from '../options';

/** Insert a code line starting with indentation. */
export const insertCodeLine = (editor: PlateEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertElements(editor, {
      children: [{ text: indent }],
      type: getCodeLineType(editor),
    });
  }
};
