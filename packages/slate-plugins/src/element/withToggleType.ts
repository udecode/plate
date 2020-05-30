import { Editor, Transforms } from 'slate';
import { isNodeInSelection } from '../common/queries';
import { DEFAULT_ELEMENT, ToggleTypeEditor } from './types';

export interface WithToggleTypeOptions {
  /**
   * Default type
   */
  typeP?: string;
}

/**
 * Toggle the type of the selected node with a configurable default type.
 * @param typeP
 */
export const withToggleType = ({
  typeP = DEFAULT_ELEMENT,
}: WithToggleTypeOptions = {}) => <T extends Editor>(e: T) => {
  const editor = e as T & ToggleTypeEditor;

  editor.toggleType = (activeType: string, defaultType = typeP) => {
    const isActive = isNodeInSelection(editor, activeType);

    Transforms.setNodes(editor, {
      type: isActive ? defaultType : activeType,
    });
  };

  return editor;
};
