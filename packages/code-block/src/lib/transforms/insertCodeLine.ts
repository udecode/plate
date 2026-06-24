import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

/** Insert a code line starting with indentation. */
export const insertCodeLine = (editor: BasePlateEditor, indentDepth = 0) => {
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    editor.update((tx) => {
      tx.nodes.insert({
        children: [{ text: indent }],
        type: editor.getType(KEYS.codeLine),
      });
    });
  }
};
