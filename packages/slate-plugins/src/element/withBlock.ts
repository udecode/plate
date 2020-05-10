import { isNodeInSelection } from 'common/queries';
import { Editor, Transforms } from 'slate';
import { DEFAULT_ELEMENT, ToggleBlockEditor } from './types';

export const withBlock = ({ typeP = DEFAULT_ELEMENT } = {}) => <
  T extends Editor
>(
  editor: T
) => {
  const e = editor as T & ToggleBlockEditor;

  e.toggleBlock = (type: string) => {
    const isActive = isNodeInSelection(e, type);

    Transforms.setNodes(e, {
      type: isActive ? typeP : type,
    });
  };

  return e;
};
