import { getCurrentSelection } from '../core/public-state';
import { RangeApi } from '../interfaces/range';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import { select } from './select';

export const collapse: SelectionMutationMethods['collapse'] = (
  editor,
  options = {}
) => {
  const { edge = 'anchor' } = options;
  const selection = getCurrentSelection(editor);

  if (!selection || !RangeApi.isRange(selection)) {
    return;
  }
  if (edge === 'anchor') {
    select(editor, selection.anchor);
  } else if (edge === 'focus') {
    select(editor, selection.focus);
  } else if (edge === 'start') {
    const [start] = RangeApi.edges(selection);
    select(editor, start);
  } else if (edge === 'end') {
    const [, end] = RangeApi.edges(selection);
    select(editor, end);
  }
};
