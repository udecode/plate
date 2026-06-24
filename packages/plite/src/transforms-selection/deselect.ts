import { getCurrentSelection } from '../core/public-state';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import { executeSetSelectionCommand } from './set-selection';

export const deselect: SelectionMutationMethods['deselect'] = (editor) => {
  const selection = getCurrentSelection(editor);

  if (selection) {
    executeSetSelectionCommand(editor, {
      type: 'set_selection',
      properties: selection,
      newProperties: null,
    });
  }
};
