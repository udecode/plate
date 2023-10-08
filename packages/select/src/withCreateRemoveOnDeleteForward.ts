import {
    isBlockAboveEmpty,
    isSelectionExpanded,
    PlateEditor,
    removeNodes,
    Value,
    WithPlatePlugin,
  } from '@udecode/plate-common';
  
  import { RemoveOnDeleteForwardPlugin } from './createRemoveOnDeleteForwardPlugin';
  
  /**
   * Set a list of element types to select on backspace
   */
  export const withCreateRemoveOnDeleteForward = <
    V extends Value = Value,
    E extends PlateEditor<V> = PlateEditor<V>,
  >(
    editor: E,
    {
      options: { query, removeNodeIfEmpty },
    }: WithPlatePlugin<RemoveOnDeleteForwardPlugin, V, E>
  ) => {
    const { deleteForward } = editor;
  
    editor.deleteForward = (unit: 'character' | 'word' | 'line' | 'block') => {
      const { selection } = editor; 
      if(!editor.selection) return;
      if (!isSelectionExpanded(editor) && isBlockAboveEmpty(editor)) {
        removeNodes(editor as any);
      } else {
        deleteForward(unit);
      }
    };
  
    return editor;
  };

  
  