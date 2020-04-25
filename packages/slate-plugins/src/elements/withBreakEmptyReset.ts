import { PARAGRAPH } from 'elements/paragraph';
import { Editor, Transforms } from 'slate';
import { isBlockTextEmpty } from './queries';

/**
 * On insert break at the start of an empty block in types,
 * replace it with a new paragraph.
 */
export const withBreakEmptyReset = ({
  types,
  onUnwrap,
}: {
  types: string[];
  onUnwrap?: any;
}) => <T extends Editor>(editor: T) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const currentNodeEntry = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });

    if (currentNodeEntry) {
      const [currentNode] = currentNodeEntry;

      if (isBlockTextEmpty(currentNode)) {
        const parent = Editor.above(editor, {
          match: (n) => types.includes(n.type),
        });

        if (parent) {
          Transforms.setNodes(editor, { type: PARAGRAPH });

          if (onUnwrap) onUnwrap();

          return;
        }
      }
    }

    insertBreak();
  };

  return editor;
};
