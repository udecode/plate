import type { Path, SlateEditor, TElement } from '@udecode/plate';

import { BaseListItemPlugin } from '../BaseListPlugin';

/** Is the list nested, i.e. its parent is a list item. */
export const isListNested = (editor: SlateEditor, listPath: Path) => {
  const listParentNode = editor.api.parent<TElement>(listPath)?.[0];

  return listParentNode?.type === editor.getType(BaseListItemPlugin);
};
