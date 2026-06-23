import { executeCommand } from '../core/command-registry';
import { runEditorTransaction } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import type { Editor, EditorTransformApi } from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import type { TextUnit } from '../types/types';
import type { WithEditorFirstArg } from '../utils/types';

type DeleteCommand = {
  direction: 'backward' | 'forward';
  type: 'delete';
  unit: TextUnit;
};

const applyDelete = (editor: Editor, command: DeleteCommand) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (
      selection &&
      RangeApi.isRange(selection) &&
      RangeApi.isCollapsed(selection)
    ) {
      getEditorTransformRegistry(editor).delete({
        unit: command.unit,
        reverse: command.direction === 'backward',
      });
    }
  });
};

export const deleteForward: WithEditorFirstArg<
  EditorTransformApi['deleteForward']
> = (editor, unit) => {
  executeCommand<DeleteCommand>(
    editor,
    { direction: 'forward', type: 'delete', unit },
    (command) => {
      applyDelete(editor, command);
      return true;
    }
  );
};
