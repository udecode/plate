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

  if (value.length === 0) {
    editor.update.value.replace({ children: [] });
  }

  editor.update.value.repair();

  return {
    children: editor.read.children(),
  };
};
