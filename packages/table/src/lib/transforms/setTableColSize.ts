import type { SlateEditor, TTableElement } from 'platejs';

import { KEYS } from 'platejs';

import { getTableColumnCount } from '../queries/getTableColumnCount';

type TableNodeQueryOptions = NonNullable<
  Parameters<SlateEditor['api']['node']>[0]
>;

export const setTableColSize = (
  editor: SlateEditor,
  { colIndex, width }: { colIndex: number; width: number },
  options: TableNodeQueryOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: KEYS.table },
    ...options,
  });

  if (!table) return;

  const [tableNode, tablePath] = table;

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array.from({ length: getTableColumnCount(tableNode) }, () => 0);

  colSizes[colIndex] = width;

  editor.update((tx) => {
    tx.nodes.set({ colSizes } satisfies Partial<TTableElement>, {
      at: tablePath,
    });
  });
};
