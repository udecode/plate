import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TColumnGroupElement } from '../types';

export const insertColumnGroup = (
  editor: SlateEditor,
  {
    columns = 2,
    select: selectProp,
    ...options
  }: InsertNodesOptions & {
    columns?: number;
  } = {}
) => {
  const width = 100 / columns;

  editor.tf.withoutNormalizing(() => {
    editor.tf.insertNodes<TColumnGroupElement>(
      {
        children: new Array(columns).fill(null).map(() => ({
          children: [editor.api.create.block()],
          type: KEYS.column,
          width: `${width}%`,
        })),
        type: KEYS.columnGroup,
      },
      options
    );

    if (selectProp) {
      const entry = editor.api.node({
        at: options.at,
        match: { type: editor.getType(KEYS.column) },
      });

      if (!entry) return;

      editor.tf.select(entry[1].concat([0]));
    }
  });
};
