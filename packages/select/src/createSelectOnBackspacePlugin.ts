import {
  isCollapsed,
  queryNode,
  QueryNodeOptions,
} from '@udecode/plate-common';
import {
  getPlatePluginWithOverrides,
  TNode,
  WithOverride,
} from '@udecode/plate-core';
import Slate, { Editor, Transforms } from 'slate';

export type SelectOnBackspacePluginOptions = QueryNodeOptions;
export type WithSelectOnBackspaceOptions = SelectOnBackspacePluginOptions;

/**
 * Set a list of element types to select on backspace
 */
export const withSelectOnBackspace = (
  query: WithSelectOnBackspaceOptions
): WithOverride => (editor) => {
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

/**
 * @see {@link withSelectOnBackspace}
 */
export const createSelectOnBackspacePlugin = getPlatePluginWithOverrides(
  withSelectOnBackspace
);
