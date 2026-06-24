import { getCurrentSelection } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { RangeApi } from '../interfaces/range';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';

export const collapse: SelectionMutationMethods['collapse'] = (
  editor,
  options = {}
) => {
  const { edge = 'anchor' } = options;
  const selection = getCurrentSelection(editor);

  if (!selection) {
    return;
  }
  if (edge === 'anchor') {
    getEditorTransformRegistry(editor).select(selection.anchor);
  } else if (edge === 'focus') {
    getEditorTransformRegistry(editor).select(selection.focus);
  } else if (edge === 'start') {
    const [start] = RangeApi.edges(selection);
    getEditorTransformRegistry(editor).select(start);
  } else if (edge === 'end') {
    const [, end] = RangeApi.edges(selection);
    getEditorTransformRegistry(editor).select(end);
  }
};
