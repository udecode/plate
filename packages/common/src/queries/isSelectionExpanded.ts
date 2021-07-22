import { TEditor } from '@udecode/plate-core';
import { isExpanded } from './isExpanded';

/**
 * Is the selection expanded.
 */
export const isSelectionExpanded = (editor: TEditor) =>
  isExpanded(editor.selection);
