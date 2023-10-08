import {
  deleteForward,
    getNodeEntries,
    getPointBefore,
    isBlockAboveEmpty,
    isSelectionExpanded,
    PlateEditor,
    queryNode,
    removeNodes,
    Value,
    WithPlatePlugin,
  } from '@udecode/plate-common';
  
  import { DeletePlugin } from './createDeletePlugin';
import Slate from 'slate';
  
  /**
   * Set a list of element types to select on backspace
   */
  export const withDelete = <
    V extends Value = Value,
    E extends PlateEditor<V> = PlateEditor<V>,
  >(
    editor: E,
    {
      options: { query },
    }: WithPlatePlugin<DeletePlugin, V, E>
  ) => {
    const { deleteForward } = editor;
  editor.deleteForward = (unit: 'character' | 'word' | 'line' | 'block') => {
    const { selection } = editor; 
    console.log("outer" ,query);
    if(!editor.selection) return;
    

    if (!isSelectionExpanded(editor) && isBlockAboveEmpty(editor)) {
      console.log("asdas");
      if (query) {
        //if query value is passed
        const pointBefore = getPointBefore(editor, selection as Slate.Location, {
          unit,
        });
  
        if (pointBefore) {
          const [prevCell] = getNodeEntries(editor, {
            match: (node) => queryNode([node, pointBefore.path], query),
            at: pointBefore,
          });
          if (!!prevCell && pointBefore) {
            console.log("valid cell");
              removeNodes(editor as any);
           
          }
           else {
            console.log("invalid cell");

              deleteForward(unit);
            }
      }
      else{
        deleteForward(unit);
      }
    }
      else{
        console.log("outside query");
        removeNodes(editor as any);
      }
    } else {
      deleteForward(unit);
    }
  };
 
  return editor;
  };

  
  