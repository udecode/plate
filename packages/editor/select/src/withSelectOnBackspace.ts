import {
  getNodeEntries,
  getPointBefore,
  isCollapsed,
  PlateEditor,
  queryNode,
  select,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import Slate from 'slate';
import { SelectOnBackspacePlugin } from './createSelectOnBackspacePlugin';

/**
 * Set a list of element types to select on backspace
 */
export const withSelectOnBackspace = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options: { query } }: WithPlatePlugin<SelectOnBackspacePlugin, V, E>
) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit: 'character' | 'word' | 'line' | 'block') => {
    const { selection } = editor;
    if (unit === 'character' && isCollapsed(selection)) {
      const prevNode = getPointBefore(editor, selection as Slate.Location, {
        unit,
      });
      if (prevNode) {
        const [prevCell] = getNodeEntries(editor, {
          match: (node) => queryNode([node, prevNode.path], query),
          at: prevNode,
        });

        if (!!prevCell && prevNode) {
          // don't delete image, set selection there
          select(editor, prevNode);
        } else {
          deleteBackward(unit);
        }
      } else {
        deleteBackward(unit);
      }
    } else {
      deleteBackward(unit);
    }
  };

  return editor;
};
