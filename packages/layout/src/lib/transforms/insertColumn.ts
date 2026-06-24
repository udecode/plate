import type { EditorUpdateTransaction } from '@platejs/plite';
import type { TColumnElement } from 'platejs';

import { KEYS } from 'platejs';

import { type ColumnEditor, createColumnBlock } from './ColumnEditor';

export type InsertColumnNodeOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['insert']>[1]
>;

export type InsertColumnOptions = InsertColumnNodeOptions & {
  width?: string;
};

export const insertColumn = (
  editor: ColumnEditor,
  { width = '33%', ...options }: InsertColumnOptions = {}
) => {
  editor.update((tx) => {
    tx.nodes.insert<TColumnElement>(
      {
        children: [createColumnBlock(editor)],
        type: editor.getType(KEYS.column) as any,
        width,
      },
      options
    );
  });
};
