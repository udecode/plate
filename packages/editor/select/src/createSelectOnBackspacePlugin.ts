import {
  isCollapsed,
  queryNode,
  QueryNodeOptions,
} from '@udecode/plate-common';
import {
  createPlugin,
  getPlugin,
  TNode,
  WithOverride,
} from '@udecode/plate-core';
import Slate, { Editor, Transforms } from 'slate';

export type SelectOnBackspacePlugin = {
  query?: QueryNodeOptions;
};

export const KEY_SELECT_ON_BACKSPACE = 'selectOnBackspace';

/**
 * Set a list of element types to select on backspace
 */
export const withSelectOnBackspace = (): WithOverride => (editor) => {
  const { deleteBackward } = editor;

  const { query } = getPlugin<SelectOnBackspacePlugin>(
    editor,
    KEY_SELECT_ON_BACKSPACE
  );

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
export const createSelectOnBackspacePlugin = createPlugin<SelectOnBackspacePlugin>(
  {
    key: KEY_SELECT_ON_BACKSPACE,
    withOverrides: withSelectOnBackspace(),
  }
);
