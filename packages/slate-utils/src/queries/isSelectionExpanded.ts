import { isExpanded, TEditor, Value } from '@udecode/slate';

/**
 * Is the selection expanded.
 */
export const isSelectionExpanded = <V extends Value>(editor: TEditor<V>) =>
  isExpanded(editor.selection);
