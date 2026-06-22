import type { Element } from '@platejs/slate';
import type { Path } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';

import { KEYS } from '@platejs/utils';

/** Is the list nested, i.e. its parent is a list item. */
export const isListNested = (editor: SlateEditor, listPath: Path) => {
  const listParentNode = editor.api.parent<Element>(listPath)?.[0];

  return listParentNode?.type === editor.getType(KEYS.li);
};
