import { Editor, Transforms } from 'slate';
import { PARAGRAPH } from './paragraph';
import { isBlockActive } from './queries';
import { ToggleBlockEditor } from './types';

export const withBlock = ({
  unwrapTypes = [],
}: { unwrapTypes?: string[] } = {}) => <T extends Editor>(editor: T) => {
  const e = editor as T & ToggleBlockEditor;

  e.toggleBlock = (format: string) => {
    const isActive = isBlockActive(e, format);

    Transforms.setNodes(e, {
      type: isActive ? PARAGRAPH : format,
    });

    if (unwrapTypes.length) {
      Transforms.unwrapNodes(editor, {
        match: n => unwrapTypes.includes(n.type),
        split: true,
      });
    }
  };

  return e;
};
