import { Editor, Transforms } from 'slate';
import { PARAGRAPH } from './paragraph';
import { isBlockActive } from './queries';
import { ToggleBlockEditor } from './types';

export const withBlock = <T extends Editor>(editor: T) => {
  const e = editor as T & ToggleBlockEditor;

  e.toggleBlock = (format: string) => {
    const isActive = isBlockActive(e, format);

    Transforms.setNodes(e, {
      type: isActive ? PARAGRAPH : format,
    });
  };

  return e;
};
