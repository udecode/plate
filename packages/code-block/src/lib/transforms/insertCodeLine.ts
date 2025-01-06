import { type SlateEditor, insertElements } from '@udecode/plate';

import { BaseCodeLinePlugin } from '../BaseCodeBlockPlugin';

/** Insert a code line starting with indentation. */
export const insertCodeLine = (editor: SlateEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    insertElements(editor, {
      children: [{ text: indent }],
      type: editor.getType(BaseCodeLinePlugin),
    });
  }
};
