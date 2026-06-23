import type { Element } from '@platejs/plite';
import type { Path } from '@platejs/plite';
import type { BasePlateEditor } from '@platejs/core';

import { KEYS } from '@platejs/utils';

/** Is the list nested, i.e. its parent is a list item. */
export const isListNested = (editor: BasePlateEditor, listPath: Path) => {
  if (!listPath) return false;

  const listParentNode = editor.api.parent<Element>(listPath)?.[0];

  return listParentNode?.type === editor.getType(KEYS.li);
};
