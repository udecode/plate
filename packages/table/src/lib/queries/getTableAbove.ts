import type { EditorAboveOptions } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type { TTableElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';

export const getTableAbove = (
  editor: BaseEditor,
  options?: EditorAboveOptions<TTableElement>
) =>
  editor.read.nodes.above<TTableElement>({
    match: {
      type: editor.getType(KEYS.table),
    },
    ...options,
  });
