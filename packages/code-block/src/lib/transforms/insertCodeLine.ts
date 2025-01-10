import type { SlateEditor } from '@udecode/plate';

import { BaseCodeLinePlugin } from '../BaseCodeBlockPlugin';

/** Insert a code line starting with indentation. */
export const insertCodeLine = (editor: SlateEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    editor.tf.insertNodes({
      children: [{ text: indent }],
      type: editor.getType(BaseCodeLinePlugin),
    });
  }
};
