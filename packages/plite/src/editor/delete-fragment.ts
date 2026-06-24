import { executeCommand } from '../core/command-registry';
import { runEditorTransaction } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import type { EditorStaticApi } from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';

type DeleteFragmentCommand = {
  at?: NonNullable<Parameters<EditorStaticApi['deleteFragment']>[1]>['at'];
  direction: NonNullable<
    Parameters<EditorStaticApi['deleteFragment']>[1]
  >['direction'];
  type: 'delete_fragment';
};

const applyDeleteFragment: EditorStaticApi['deleteFragment'] = (
  editor,
  { at, direction = 'forward' } = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget({ at });

    if (
      selection &&
      RangeApi.isRange(selection) &&
      RangeApi.isExpanded(selection)
    ) {
      getEditorTransformRegistry(editor).delete({
        at: selection,
        reverse: direction === 'backward',
      });
    }
  });
};

export const deleteFragment: EditorStaticApi['deleteFragment'] = (
  editor,
  { at, direction = 'forward' } = {}
) => {
  const command: DeleteFragmentCommand =
    at === undefined
      ? { direction, type: 'delete_fragment' }
      : { at, direction, type: 'delete_fragment' };

  executeCommand<DeleteFragmentCommand>(editor, command, (command) => {
    applyDeleteFragment(editor, {
      at: command.at,
      direction: command.direction,
    });
    return true;
  });
};
