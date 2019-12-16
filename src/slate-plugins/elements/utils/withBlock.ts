import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common';
import { isBlockActive } from '../queries';

export const withBlock = (type: string) => (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { format } = command;
    if (command.type === 'format_block' && type === format) {
      const isActive = isBlockActive(editor, format);

      // const isList = type.includes(format);

      // Object.values(ListType).forEach(f => {
      //   Editor.unwrapNodes(editor, { match: { type: f }, split: true });
      // });

      Editor.setNodes(editor, {
        type: isActive ? ElementType.PARAGRAPH : format,
      });
      // Editor.setNodes(editor, {
      //   type: isActive
      //     ? ElementType.PARAGRAPH
      //     : isList
      //     ? ElementType.LIST_ITEM
      //     : format,
      // });

      // if (!isActive && isList) {
      //   Editor.wrapNodes(editor, { type: format, children: [] });
      // }
    } else {
      exec(command);
    }
  };

  return editor;
};
