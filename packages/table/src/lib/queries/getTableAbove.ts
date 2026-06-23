import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

type TableBlockQueryOptions = NonNullable<
  Parameters<SlateEditor['api']['block']>[0]
>;

export const getTableAbove = (
  editor: SlateEditor,
  options?: TableBlockQueryOptions
) =>
  editor.api.block({
    above: true,
    match: {
      type: editor.getType(KEYS.table),
    },
    ...options,
  });
