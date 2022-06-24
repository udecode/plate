import { TEditor, Value } from '../slate/editor/TEditor';
import { isExpanded } from '../slate/range/isExpanded';

/**
 * Is the selection expanded.
 */
export const isSelectionExpanded = <V extends Value>(editor: TEditor<V>) =>
  isExpanded(editor.selection);
