import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common';
import { Plugin } from 'slate-react';
import { isBlockActive } from './queries';

export const withBlock = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { format } = command;
    if (command.type === 'format_block') {
      const isActive = isBlockActive(editor, format);

      Editor.setNodes(editor, {
        type: isActive ? ElementType.PARAGRAPH : format,
      });
    } else {
      exec(command);
    }
  };

  return editor;
};

export const BlockPlugin = (): Plugin => ({
  editor: withBlock,
});
