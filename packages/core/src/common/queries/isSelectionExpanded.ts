import { isExpanded } from '../../slate/range/isExpanded';
import { TEditor, Value } from '../../slate/types/TEditor';

/**
 * Is the selection expanded.
 */
export const isSelectionExpanded = <V extends Value>(editor: TEditor<V>) =>
  isExpanded(editor.selection);
