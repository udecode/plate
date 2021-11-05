import {
  getPlatePluginType,
  PlateEditor,
  TEditor,
  TElement,
} from '@udecode/plate-core';
import { someNode } from '../queries/someNode';
import { EditorNodesOptions } from '../types/Editor.types';
import { ELEMENT_DEFAULT } from '../types/node.types';
import { setNodes } from './setNodes';

export interface ToggleNodeTypeOptions {
  /**
   * If there is no node type above the selection, set the selected node type to activeType.
   */
  activeType?: string;

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
  editor: TEditor,
  options: ToggleNodeTypeOptions,
  editorNodesOptions?: Omit<EditorNodesOptions, 'match'>
) => {
  const {
    activeType,
    inactiveType = getPlatePluginType(editor as PlateEditor, ELEMENT_DEFAULT),
  } = options;

  if (!activeType || !editor.selection) return;

  const isActive = someNode(editor, {
    ...editorNodesOptions,
    match: {
      type: activeType,
    },
  });

  if (isActive && activeType === inactiveType) return;

  setNodes<TElement>(editor, {
    type: isActive ? inactiveType : activeType,
  });
};
