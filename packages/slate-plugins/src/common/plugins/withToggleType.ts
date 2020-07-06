import { Editor, Transforms } from 'slate';
import { isNodeTypeIn } from '../queries/index';
import { DEFAULT_ELEMENT } from '../types/node.types';

export interface WithToggleTypeOptions {
  /**
   * Default type
   */
  defaultType?: string;
}

export interface ToggleTypeEditor extends Editor {
  /**
   * Toggle the type of the selected nodes.
   */
  toggleType: (activeType: string, defaultType?: string) => void;
}

/**
 * Toggle the type of the selected node with a configurable default type.
 * @param defaultType
 */
export const withToggleType = ({
  defaultType: type = DEFAULT_ELEMENT,
}: WithToggleTypeOptions = {}) => <T extends Editor>(e: T) => {
  const editor = e as T & ToggleTypeEditor;

  editor.toggleType = (activeType: string, defaultType = type) => {
    const isActive = isNodeTypeIn(editor, activeType);

    Transforms.setNodes(editor, {
      type: isActive ? defaultType : activeType,
    });
  };

  return editor;
};
