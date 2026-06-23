import type { SlateEditor, TTableElement, TTableRowElement } from 'platejs';

import { KEYS } from 'platejs';

type TableNodeQueryOptions = NonNullable<
  Parameters<SlateEditor['api']['node']>[0]
>;

export const setTableRowSize = (
  editor: SlateEditor,
  { height, rowIndex }: { height: number; rowIndex: number },
  options: TableNodeQueryOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: KEYS.table },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;
  const tableRowPath = [...tablePath, rowIndex];

  editor.update((tx) => {
    tx.nodes.set(
      { size: height } satisfies Partial<TTableRowElement>,
      { at: tableRowPath }
    );
  });
};
