import {
  type GetAboveNodeOptions,
  type TEditor,
  type TElement,
  type TNodeEntry,
  type ValueOf,
  isElementEmpty,
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

  if (prevEntry && isElementEmpty(editor, prevEntry[0] as TElement)) {
    editor.removeNodes({ at: prevEntry[1] });
  }
};
