import {
  type SlateEditor,
  type TLocation,
  BaseParagraphPlugin,
} from '@udecode/plate';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';

export const unwrapCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(BaseCodeBlockPlugin);
  const defaultType = editor.getType(BaseParagraphPlugin);

  editor.tf.withoutNormalizing(() => {
    const codeBlockEntries = editor.api.nodes({
      at: editor.selection as TLocation,
      match: { type: codeBlockType },
    });

    const reversedCodeBlockEntries = Array.from(codeBlockEntries).reverse();

    for (const [node, path] of reversedCodeBlockEntries) {
      // Convert code block to paragraph
      editor.tf.setNodes({ type: defaultType }, { at: path });

      // Split text by newlines if needed
      const text = editor.api.string(path);
      if (text.includes('\n')) {
        const lines = text.split('\n');

        // Keep the first line in the current node
        editor.tf.select(path);
        editor.tf.delete();
        editor.tf.insertText(lines[0]);

        // Insert the rest of the lines as new paragraphs
        for (let i = 1; i < lines.length; i++) {
          editor.tf.insertBreak();
          editor.tf.insertText(lines[i]);
        }
      }
    }
  });
};
