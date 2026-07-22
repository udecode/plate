import { getCurrentSelection } from '../core/public-state';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import { writeSelection } from './set-selection';

export const deselect: SelectionMutationMethods['deselect'] = (editor) => {
  const selection = getCurrentSelection(editor);

  if (selection) {
    writeSelection(editor, null);
  }
};
