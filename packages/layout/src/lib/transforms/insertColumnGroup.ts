import type { EditorUpdateTransaction } from '@platejs/slate';
import type { TColumnGroupElement } from 'platejs';

import { KEYS } from 'platejs';

import { type ColumnEditor, createColumnBlock } from './ColumnEditor';

export type InsertColumnGroupNodeOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['insert']>[1]
>;

export type InsertColumnGroupOptions = InsertColumnGroupNodeOptions & {
  columns?: number;
};

export const insertColumnGroup = (
  editor: ColumnEditor,
  { columns = 2, select: selectProp, ...options }: InsertColumnGroupOptions = {}
) => {
  const width = 100 / columns;

  editor.update((tx) => {
    tx.withoutNormalizing(() => {
      tx.nodes.insert<TColumnGroupElement>(
        {
          children: new Array(columns).fill(null).map(() => ({
            children: [createColumnBlock(editor)],
            type: editor.getType(KEYS.column) as any,
            width: `${width}%`,
          })),
          type: editor.getType(KEYS.columnGroup) as any,
        },
        options
      );

      if (selectProp) {
        const entry = editor.api.node({
          at: options.at,
          match: { type: editor.getType(KEYS.column) },
        });

        if (!entry) return;

        tx.selection.set(entry[1].concat([0]));
      }
    });
  });
};
