import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { getCurrentSelection } from '../core/public-state';
import {
  after as editorAfter,
  before as editorBefore,
} from '../interfaces/editor';
import { type Range, RangeApi } from '../interfaces/range';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import { setSelection } from './set-selection';

export const applyMove: SelectionMutationMethods['move'] = (
  editor,
  options = {}
) => {
  const selection = getCurrentSelection(editor);
  const { distance = 1, unit = 'character', reverse = false } = options;
  let { edge = null } = options;

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
  const opts = { distance, unit };
  const props: Partial<Range> = {};

  if (edge == null || edge === 'anchor') {
    const point = reverse
      ? editorBefore(editor, anchor, opts)
      : editorAfter(editor, anchor, opts);

    if (point) {
      props.anchor = point;
    }
  }

  if (edge == null || edge === 'focus') {
    const point = reverse
      ? editorBefore(editor, focus, opts)
      : editorAfter(editor, focus, opts);

    if (point) {
      props.focus = point;
    }
  }

  setSelection(editor, props);
};

export const move: SelectionMutationMethods['move'] = (
  editor,
  options = {}
) => {
  dispatchCommand(editor, editorCommands.move, {
    options,
  });
};
