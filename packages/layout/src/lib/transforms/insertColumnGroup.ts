import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type InsertColumnGroupOptions = NodeInsertNodesOptions<Element> & {
  columns?: number;
};

export const insertColumnGroup = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { columns = 2, select: selectProp, ...options }: InsertColumnGroupOptions = {}
) => {
  const width = 100 / columns;

  tx.withoutNormalizing(({ tx }) => {
    tx.nodes.insert(
      {
        children: new Array(columns).fill(null).map(() => ({
          children: [
            { children: [{ text: '' }], type: editor.getType(KEYS.p) },
          ],
          type: editor.getType(KEYS.column),
          width: `${width}%`,
        })),
        type: editor.getType(KEYS.columnGroup),
      },
      options
    );

    if (selectProp) {
      const entry = tx.nodes.find<Element>({
        at: options.at,
        match: { type: editor.getType(KEYS.column) },
      });

      if (!entry) return;

      const point = tx.points.start(entry[1]);

      if (point) {
        tx.selection.set(point);
      }
    }
  });
};
