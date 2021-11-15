import { isCollapsed, queryNode } from '@udecode/plate-common';
import { TNode, WithOverride } from '@udecode/plate-core';
import Slate, { Editor, Transforms } from 'slate';
import { SelectOnBackspacePlugin } from './createSelectOnBackspacePlugin';

/**
 * Set a list of element types to select on backspace
 */
export const withSelectOnBackspace = (): WithOverride<
  {},
  SelectOnBackspacePlugin
> => (editor, { options: { query } }) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit: 'character' | 'word' | 'line' | 'block') => {
    const { selection } = editor;
    if (unit === 'character' && isCollapsed(selection)) {
      const prevNode = Editor.before(editor, selection as Slate.Location, {
        unit,
      });
      if (prevNode) {
        const [prevCell] = Editor.nodes<TNode>(editor, {
          match: (node) => queryNode([node as TNode, prevNode.path], query),
          at: prevNode,
        });

        if (!!prevCell && prevNode) {
          // don't delete image, set selection there
          Transforms.select(editor, prevNode);
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
