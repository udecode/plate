import { createSlateEditor, type AnySlatePlugin } from 'platejs';
import type { Selection, Value } from '@platejs/slate';

export const normalizeRoot = ({
  plugins,
  selection,
  value,
}: {
  plugins: AnySlatePlugin[];
  selection?: Selection;
  value: Value;
}) => {
  const editor = createSlateEditor({ plugins, selection, value });

  editor.tf.normalizeNode([editor, []]);

  return editor;
};
