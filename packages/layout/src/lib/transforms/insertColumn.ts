import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import type { TColumnElement } from '../types';

import { BaseColumnItemPlugin } from '../BaseColumnPlugin';

export const insertColumn = (
  editor: SlateEditor,
  { width = '33%', ...options }: { width?: string } & InsertNodesOptions = {}
) => {
  editor.tf.insertNodes<TColumnElement>(
    {
      children: [editor.api.create.block()],
      type: BaseColumnItemPlugin.key,
      width,
    },
    options as any
  );
};
