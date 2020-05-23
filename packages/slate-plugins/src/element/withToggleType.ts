import { isNodeInSelection } from 'common/queries';
import { Editor, Transforms } from 'slate';
import { DEFAULT_ELEMENT, ToggleTypeEditor } from './types';

export const withToggleType = ({ typeP = DEFAULT_ELEMENT } = {}) => <
  T extends Editor
>(
  e: T
) => {
  const editor = e as T & ToggleTypeEditor;

  editor.toggleType = (activeType: string, inactiveType = typeP) => {
    const isActive = isNodeInSelection(editor, activeType);

    Transforms.setNodes(editor, {
      type: isActive ? activeType : inactiveType,
    });
  };

  return editor;
};
