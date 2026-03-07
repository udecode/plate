import { createSlateEditor } from 'platejs';

export const normalizeRoot = ({
  plugins,
  selection,
  value,
}: {
  plugins: any[];
  selection?: any;
  value: any;
}) => {
  const editor = createSlateEditor({ plugins, selection, value });

  editor.tf.normalizeNode([editor, []]);

  return editor;
};
