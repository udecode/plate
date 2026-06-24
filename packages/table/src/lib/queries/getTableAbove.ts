import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

type TableBlockQueryOptions = NonNullable<
  Parameters<BasePlateEditor['api']['block']>[0]
>;

export const getTableAbove = (
  editor: BasePlateEditor,
  options?: TableBlockQueryOptions
) =>
  editor.api.block({
    above: true,
    match: {
      type: editor.getType(KEYS.table),
    },
    ...options,
  });
