import { Editor } from 'slate';
import { ElementType, ListType } from 'slate-plugins/common/constants/formats';
import { isBlockActive } from 'slate-plugins/elements/queries';
import { Plugin } from 'slate-react';

export const withFormat = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    if (command.type === 'format_block') {
      const { format } = command;
      const isActive = isBlockActive(editor, format);
      const isList = Object.values(ListType).includes(format);

      Object.values(ListType).forEach(f => {
        Editor.unwrapNodes(editor, { match: { type: f }, split: true });
      });

      Editor.setNodes(editor, {
        type: isActive
          ? ElementType.PARAGRAPH
          : isList
          ? ElementType.LIST_ITEM
          : format,
      });

      if (!isActive && isList) {
        Editor.wrapNodes(editor, { type: format, children: [] });
      }
    } else {
      exec(command);
    }
  };

  return editor;
};

export const FormatPlugin = (): Plugin => ({
  editor: withFormat,
});
