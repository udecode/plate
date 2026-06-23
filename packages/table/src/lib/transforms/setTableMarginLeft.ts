import type { SlateEditor, TTableElement } from 'platejs';

import { KEYS } from 'platejs';

type TableNodeQueryOptions = NonNullable<
  Parameters<SlateEditor['api']['node']>[0]
>;

export const setTableMarginLeft = (
  editor: SlateEditor,
  { marginLeft }: { marginLeft: number },
  options: TableNodeQueryOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: KEYS.table },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  editor.update((tx) => {
    tx.nodes.set({ marginLeft } satisfies Partial<TTableElement>, {
      at: tablePath,
    });
  });
};
