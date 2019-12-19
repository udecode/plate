import { Editor, Transforms } from 'slate';
import { ElementType } from 'slate-plugins/common';
import { isBlockActive } from './queries';

export const withBlock = (editor: Editor) => {
  editor.toggleBlock = (format: string) => {
    const isActive = isBlockActive(editor, format);

    Transforms.setNodes(editor, {
      type: isActive ? ElementType.PARAGRAPH : format,
    });
  };

  return editor;
};
