import { type TEditor, isExpanded } from '../interfaces';

/** Is the selection expanded. */
export const isSelectionExpanded = (editor: TEditor) =>
  isExpanded(editor.selection);
