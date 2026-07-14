import type { BaseEditor } from '@platejs/core';
import type { Path, Element } from 'platejs';

import { KEYS } from 'platejs';

/** Is the list nested, i.e. its parent is a list item. */
export const isListNested = (editor: BaseEditor, listPath: Path) => {
  const listParentNode = editor.read.nodes.parent<Element>(listPath)?.[0];

  return listParentNode?.type === editor.getType(KEYS.li);
};
