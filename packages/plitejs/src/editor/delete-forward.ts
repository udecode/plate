import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import type { TextUnit } from '../types/types';
import type { WithEditorFirstArg } from '../utils/types';

export const deleteForward: WithEditorFirstArg<(unit: TextUnit) => void> = (
  editor,
  unit
) => {
  dispatchCommand(editor, editorCommands.delete, {
    direction: 'forward',
    unit,
  });
};
