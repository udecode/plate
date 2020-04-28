import { Editor, Transforms } from 'slate';
import { PARAGRAPH } from './paragraph';
import { isBlockActive } from './queries';
import { ToggleBlockEditor } from './types';

export const withBlock = ({ typeP = PARAGRAPH } = {}) => <T extends Editor>(
  editor: T
) => {
  const e = editor as T & ToggleBlockEditor;

  e.toggleBlock = (type: string) => {
    const isActive = isBlockActive(e, type);

    Transforms.setNodes(e, {
      type: isActive ? typeP : type,
    });
  };

  return e;
};
