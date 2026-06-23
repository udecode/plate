import type { Value } from '@platejs/plite';

import type { PliteEditor } from '../../../editor';

export const setValue = <V extends Value>(
  editor: PliteEditor,
  value?: V | string
) => {
  let children = value as V;

  if (typeof value === 'string') {
    children = editor.api.html.deserialize({
      element: value,
    }) as V;
  } else if (!value || value.length === 0) {
    children = editor.api.create.value() as V;
  }

  editor.update((tx) => {
    tx.value.replace({ children });
  });
};
