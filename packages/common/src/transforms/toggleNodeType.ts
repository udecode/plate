import { Editor, Transforms } from 'slate';
import { someNode } from '../queries/someNode';
import { EditorNodesOptions } from '../types/Editor.types';
import { ELEMENT_DEFAULT } from '../types/node.types';

export interface ToggleNodeTypeOptions {
  /**
   * If there is no node type above the selection, set the selected node type to activeType.
   */
  activeType: string;

  /**
   * If there is a node type above the selection, set the selected node type to inactiveType.
   */
  inactiveType?: string;
}

/**
 * Toggle the type of the selected node.
 * Don't do anything if activeType === inactiveType.
 */
export const toggleNodeType = (
  editor: Editor,
  options: ToggleNodeTypeOptions,
  editorNodesOptions?: Omit<EditorNodesOptions, 'match'>
) => {
  const { activeType, inactiveType = ELEMENT_DEFAULT } = options;

  const isActive = someNode(editor, {
    ...editorNodesOptions,
    match: {
      type: activeType,
    },
  });

  if (isActive && activeType === inactiveType) return;

  Transforms.setNodes(editor, {
    type: isActive ? inactiveType : activeType,
  } as any);
};
