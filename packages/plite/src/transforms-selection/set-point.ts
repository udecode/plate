import { getCurrentSelection } from '../core/public-state';
import { RangeApi } from '../interfaces/range';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import { setSelection } from './set-selection';

export const setPoint: SelectionMutationMethods['setPoint'] = (
  editor,
  props,
  options = {}
) => {
  const selection = getCurrentSelection(editor);
  let { edge = 'both' } = options;

  if (!selection) {
    return;
  }

  if (edge === 'start') {
    edge = RangeApi.isBackward(selection) ? 'focus' : 'anchor';
  }

  if (edge === 'end') {
    edge = RangeApi.isBackward(selection) ? 'anchor' : 'focus';
  }

  const { anchor, focus } = selection;

  if (edge === 'both') {
    setSelection(editor, {
      anchor: { ...anchor, ...props },
      focus: { ...focus, ...props },
    });
    return;
  }

  const point = edge === 'anchor' ? anchor : focus;

  setSelection(editor, {
    [edge === 'anchor' ? 'anchor' : 'focus']: { ...point, ...props },
  });
};
