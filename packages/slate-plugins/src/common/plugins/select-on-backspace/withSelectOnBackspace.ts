import Slate, { Editor, Transforms } from 'slate';
import { isCollapsed, isNodeType } from '../../queries';
import { QueryOptions } from '../../types';

export interface WithSelectOnBackspaceOptions extends QueryOptions {}

// Set a list of element types to select on backspace
export const withSelectOnBackspace = (query: WithSelectOnBackspaceOptions) => <
  T extends Editor
>(
  editor: T
) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit: 'character' | 'word' | 'line' | 'block') => {
    const { selection } = editor;
    if (unit === 'character' && isCollapsed(selection)) {
      const prevNode = Editor.before(editor, selection as Slate.Location, {
        unit,
      });
      if (prevNode) {
        const [prevCell] = Editor.nodes(editor, {
          match: (node) => isNodeType([node, prevNode.path], query),
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
