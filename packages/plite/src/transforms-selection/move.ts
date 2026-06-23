import { executeCommand } from '../core/command-registry';
import { getCurrentSelection } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { Editor } from '../interfaces/editor';
import { type Range, RangeApi } from '../interfaces/range';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';

type MoveSelectionCommand = {
  options: Parameters<SelectionMutationMethods['move']>[1];
  type: 'move_selection';
};

const applyMove: SelectionMutationMethods['move'] = (editor, options = {}) => {
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
      ? Editor.before(editor, anchor, opts)
      : Editor.after(editor, anchor, opts);

    if (point) {
      props.anchor = point;
    }
  }

  if (edge == null || edge === 'focus') {
    const point = reverse
      ? Editor.before(editor, focus, opts)
      : Editor.after(editor, focus, opts);

    if (point) {
      props.focus = point;
    }
  }

  getEditorTransformRegistry(editor).setSelection(props);
};

export const move: SelectionMutationMethods['move'] = (
  editor,
  options = {}
) => {
  executeCommand<MoveSelectionCommand>(
    editor,
    { options, type: 'move_selection' },
    (command) => {
      applyMove(editor, command.options);
      return true;
    }
  );
};
