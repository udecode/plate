import type {
  GetAboveNodeOptions,
  TEditor,
  TElement,
  TNodeEntry,
  ValueOf,
} from '../interfaces';

import { getBlockAbove, getPreviousSiblingNode } from '../queries';

export const removeEmptyPreviousBlock = <E extends TEditor>(
  editor: E,
  options: GetAboveNodeOptions<ValueOf<E>> = {}
) => {
  const entry = getBlockAbove(editor, options);

  if (!entry) return;

  const prevEntry = getPreviousSiblingNode(editor, entry[1]) as
    | TNodeEntry
    | undefined;

  if (prevEntry && editor.api.isEmpty(prevEntry[0] as TElement)) {
    editor.tf.removeNodes({ at: prevEntry[1] });
  }
};
