import { Editor } from 'slate';
import { isMarkActive } from './queries';
import { MarkCommand } from './types';

export const withToggleMark = (editor: Editor) => {
  const { exec } = editor;
  editor.exec = command => {
    const { format } = command;
    if (command.type === MarkCommand.TOGGLE_MARK) {
      const isActive = isMarkActive(editor, format);
      console.log(isActive);
      if (isActive) {
        editor.exec({ type: MarkCommand.REMOVE_MARK, key: format });
      } else {
        editor.exec({ type: MarkCommand.ADD_MARK, key: format, value: true });
      }
    } else {
      exec(command);
    }
  };
  return editor;
};
