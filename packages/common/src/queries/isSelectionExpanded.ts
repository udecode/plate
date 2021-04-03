import { TEditor } from '@udecode/slate-plugins-core';
import { isExpanded } from './isExpanded';

/**
 * Is the selection expanded.
 */
export const isSelectionExpanded = (editor: TEditor) =>
  isExpanded(editor.selection);
