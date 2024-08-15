import {
  type GetNodeEntriesOptions,
  setElements,
  someNode,
} from '@udecode/slate';

import type { PlateEditor } from '../editor';

import { ParagraphPlugin } from '../plugins';

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
export const toggleNodeType = <E extends PlateEditor = PlateEditor>(
  editor: E,
  options: ToggleNodeTypeOptions,
  editorNodesOptions?: Omit<GetNodeEntriesOptions<E>, 'match'>
) => {
  const { activeType, inactiveType = editor.getType(ParagraphPlugin) } =
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
