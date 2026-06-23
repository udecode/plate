import { type AnySlatePlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';
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
  const editor = createPlateEditor({
    plugins,
    runtime: 'slate-v2',
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
