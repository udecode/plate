import { type TEditor, isExpanded } from '@udecode/slate';

/** Is the selection expanded. */
export const isSelectionExpanded = (editor: TEditor) =>
  isExpanded(editor.selection);
