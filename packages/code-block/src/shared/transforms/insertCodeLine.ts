import {
  type PlateEditor,
  type Value,
  insertElements,
} from '@udecode/plate-common/server';

import { getCodeLineType } from '../options';

/** Insert a code line starting with indentation. */
export const insertCodeLine = <V extends Value>(
  editor: PlateEditor<V>,
  indentDepth = 0
) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertElements(
      editor,
      editor.blockFactory({
        children: [{ text: indent }],
        type: getCodeLineType(editor),
      })
    );
  }
};
