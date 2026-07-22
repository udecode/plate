import type { BaseEditor } from '@platejs/core';
import type { EditorStateView, Element, Path } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Is the list nested, i.e. its parent is a list item. */
export const isListNested = (
  editor: BaseEditor,
  listPath: Path,
  state: Pick<EditorStateView, 'nodes'> = editor.read
) => {
  const listParentNode = state.nodes.parent<Element>(listPath)?.[0];

  return listParentNode?.type === editor.getType(KEYS.li);
};
