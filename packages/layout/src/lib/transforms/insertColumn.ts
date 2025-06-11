import type { InsertNodesOptions, SlateEditor, TColumnElement } from 'platejs';

import { KEYS } from 'platejs';

export const insertColumn = (
  editor: SlateEditor,
  { width = '33%', ...options }: { width?: string } & InsertNodesOptions = {}
) => {
  editor.tf.insertNodes<TColumnElement>(
    {
      children: [editor.api.create.block()],
      type: editor.getType(KEYS.column) as any,
      width,
    },
    options as any
  );
};
