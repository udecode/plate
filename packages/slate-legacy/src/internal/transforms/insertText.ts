import { Transforms } from 'slate';

import type { Editor, InsertTextOptions } from '../../interfaces';

import { getAt } from '../../utils';

export const insertText = (
  editor: Editor,
  text: string,
  { marks = true, ...options }: InsertTextOptions = {}
) => {
  const at = getAt(editor, options.at);

  // Case 1: Insert at options.at if specified, regardless of selection
  if (at) {
    Transforms.insertText(editor as any, text, { ...options, at });

    return;
  }
  // Case 2: Default Slate behavior - only proceed if there's a selection
  if (editor.selection) {
    if (marks && editor.marks) {
      // Case 2.1: Insert with marks if any
      const node = { text, ...editor.marks };
      editor.tf.insertNodes(node, {
        voids: options.voids,
      });
      editor.marks = null;
    } else {
      // Case 2.2: Insert plain text
      Transforms.insertText(editor as any, text, options as any);
    }
  }
};
