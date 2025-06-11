import type { Descendant, EditorTransforms, Value } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';

export const setValue = <V extends Value>(
  editor: SlateEditor,
  value?: V | string
) => {
  let children: Descendant[] = value as any;

  if (typeof value === 'string') {
    children = editor.api.html.deserialize({
      element: value,
    });
  } else if (!value || value.length === 0) {
    children = editor.api.create.value();
  }

  (editor.tf as EditorTransforms).replaceNodes(children, {
    at: [],
    children: true,
  });
};
