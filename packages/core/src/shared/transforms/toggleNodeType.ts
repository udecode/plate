import {
  type GetNodeEntriesOptions,
  type Value,
  setElements,
  someNode,
} from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';

import { ELEMENT_DEFAULT } from '../constants/ELEMENT_DEFAULT';
import { getPluginType } from '../utils';

export interface ToggleNodeTypeOptions {
  /**
   * If there is no node type above the selection, set the selected node type to
   * activeType.
   */
  activeType?: string;

  /**
   * If there is a node type above the selection, set the selected node type to
   * inactiveType.
   */
  inactiveType?: string;
}

/**
 * Toggle the type of the selected node. Don't do anything if activeType ===
 * inactiveType.
 */
export const toggleNodeType = <V extends Value>(
  editor: PlateEditor<V>,
  options: ToggleNodeTypeOptions,
  editorNodesOptions?: Omit<GetNodeEntriesOptions<V>, 'match'>
) => {
  const { activeType, inactiveType = getPluginType(editor, ELEMENT_DEFAULT) } =
    options;

  const at = editorNodesOptions?.at ?? editor.selection;

  if (!activeType || !at) return;

  const isActive = someNode(editor, {
    ...editorNodesOptions,
    match: {
      type: activeType,
    },
  });

  if (isActive && activeType === inactiveType) return;

  setElements(
    editor,
    {
      type: isActive ? inactiveType : activeType,
    },
    { at: at as any }
  );
};
