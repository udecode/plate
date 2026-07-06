import type { AnyBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import type { Selection, Value } from '@platejs/plite';

export const normalizeRoot = ({
  plugins,
  selection,
  value,
}: {
  plugins: AnyBasePlugin[];
  selection?: Selection;
  value: Value;
}) => {
  const editor = createPlateEditor({
    plugins,
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
    children: editor.read.children(),
  };
};
