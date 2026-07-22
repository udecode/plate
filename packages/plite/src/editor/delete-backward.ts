import { dispatchCommand } from '../core/command-registry';
import { type DeleteCommand, editorCommands } from '../core/editor-commands';
import { runEditorTransaction } from '../core/public-state';
import type { Editor } from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { deleteText } from '../transforms-text/delete-text';
import type { TextUnit } from '../types/types';
import type { WithEditorFirstArg } from '../utils/types';

export const applyDelete = (editor: Editor, command: DeleteCommand) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (
      selection &&
      RangeApi.isRange(selection) &&
      RangeApi.isCollapsed(selection)
    ) {
      deleteText(editor, {
        unit: command.unit,
        reverse: command.direction === 'backward',
      });
    }
  });
};

export const deleteBackward: WithEditorFirstArg<(unit: TextUnit) => void> = (
  editor,
  unit
) => {
  dispatchCommand(editor, editorCommands.delete, {
    direction: 'backward',
    unit,
  });
};
