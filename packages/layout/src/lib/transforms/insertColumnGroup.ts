import type {
  InsertNodesOptions,
  SlateEditor,
  TColumnGroupElement,
} from 'platejs';

import { KEYS } from 'platejs';

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

      editor.tf.select(entry[1].concat([0]));
    }
  });
};
