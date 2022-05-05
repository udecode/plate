import {
  getNodes,
  getPointBefore,
  isCollapsed,
  queryNode,
  select,
  TNode,
  WithOverride,
} from '@udecode/plate-core';
import Slate, { Editor } from 'slate';
import { SelectOnBackspacePlugin } from './createSelectOnBackspacePlugin';

/**
 * Set a list of element types to select on backspace
 */
export const withSelectOnBackspace: WithOverride<
  {},
  SelectOnBackspacePlugin
> = (editor, { options: { query } }) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit: 'character' | 'word' | 'line' | 'block') => {
    const { selection } = editor;
    if (unit === 'character' && isCollapsed(selection)) {
      const prevNode = getPointBefore(editor, selection as Slate.Location, {
        unit,
      });
      if (prevNode) {
        const [prevCell] = getNodes(editor, {
          match: (node) => queryNode([node as TNode, prevNode.path], query),
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
