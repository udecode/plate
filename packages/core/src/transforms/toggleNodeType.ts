import { someNode } from '../../../slate-utils/src/queries/someNode';
import { GetNodeEntriesOptions } from '../../../slate-utils/src/slate/editor/getNodeEntries';
import { Value } from '../../../slate-utils/src/slate/editor/TEditor';
import { setElements } from '../../../slate-utils/src/transforms/setElements';
import { ELEMENT_DEFAULT } from '../types/plate/node.types';
import { PlateEditor } from '../types/plate/PlateEditor';
import { getPluginType } from '../utils/plate/getPluginType';

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
export const toggleNodeType = <V extends Value>(
  editor: PlateEditor<V>,
  options: ToggleNodeTypeOptions,
  editorNodesOptions?: Omit<GetNodeEntriesOptions<V>, 'match'>
) => {
  const {
    activeType,
    inactiveType = getPluginType(editor, ELEMENT_DEFAULT),
  } = options;

  if (!activeType || !editor.selection) return;

  const isActive = someNode(editor, {
    ...editorNodesOptions,
    match: {
      type: activeType,
    },
  });

  if (isActive && activeType === inactiveType) return;

  setElements(editor, {
    type: isActive ? inactiveType : activeType,
  });
};
