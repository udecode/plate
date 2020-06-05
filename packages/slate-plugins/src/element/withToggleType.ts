import { Editor, Transforms } from 'slate';
import { isNodeInSelection } from '../common/queries';
import { DEFAULT_ELEMENT, ToggleTypeEditor } from './types';

export interface WithToggleTypeOptions {
  /**
   * Default type
   */
  defaultType?: string;
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
    const isActive = isNodeInSelection(editor, activeType);

    Transforms.setNodes(editor, {
      type: isActive ? defaultType : activeType,
    });
  };

  return editor;
};
