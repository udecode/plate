import {
  type SlateEditor,
  type TLocation,
  BaseParagraphPlugin,
  NodeApi,
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

    for (const codeBlockEntry of reversedCodeBlockEntries) {
      const codeLineEntries = NodeApi.children(editor, codeBlockEntry[1]);

      for (const [, path] of codeLineEntries) {
        editor.tf.setNodes({ type: defaultType }, { at: path });
      }

      editor.tf.unwrapNodes({
        at: codeBlockEntry[1],
        match: { type: codeBlockType },
        split: true,
      });
    }
  });
};
