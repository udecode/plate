import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TColumnElement } from '../types';

export const insertColumn = (
  editor: SlateEditor,
  { width = '33%', ...options }: { width?: string } & InsertNodesOptions = {}
) => {
  editor.tf.insertNodes<TColumnElement>(
    {
      children: [editor.api.create.block()],
      type: KEYS.column,
      width,
    },
    options as any
  );
};
