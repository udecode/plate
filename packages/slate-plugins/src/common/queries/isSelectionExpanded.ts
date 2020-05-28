import { isExpanded } from 'common/queries/isExpanded';
import { Editor } from 'slate';

/**
 * Is the selection expanded.
 */
export const isSelectionExpanded = (editor: Editor) =>
  isExpanded(editor.selection);
