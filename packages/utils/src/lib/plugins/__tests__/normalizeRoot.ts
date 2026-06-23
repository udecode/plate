import type { AnyEditorPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';
import type { Selection, Value } from '@platejs/plite';

export const normalizeRoot = ({
  plugins,
  selection,
  value,
}: {
  plugins: AnyEditorPlugin[];
  selection?: Selection;
  value: Value;
}) => {
  const editor = createPlateEditor({
    plugins,
    runtime: 'plite',
    selection,
    ...(value.length > 0 ? { value } : {}),
  });

  editor.update((tx) => {
    if (value.length === 0) {
      tx.value.replace({ children: [] });
    }

    tx.normalize({ force: true });
  });

  return {
    children: editor.read((state) => state.value.root()),
  };
};
