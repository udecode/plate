import { PARAGRAPH } from 'elements/paragraph';
import { Editor, Transforms } from 'slate';

/**
 * On insert break at the start of an empty block in types,
 * replace it with a new paragraph.
 */
export const withBreakEmptyReset = ({ types }: { types: string[] }) => <
  T extends Editor
>(
  editor: T
) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    });

    if (match) {
      const [matchingNode] = match;
      if (types.includes(matchingNode.type)) {
        if (
          matchingNode.children[matchingNode.children.length - 1].text
            .length === 0
        ) {
          return Transforms.setNodes(editor, { type: PARAGRAPH });
        }
      }
    }

    insertBreak();
  };

  return editor;
};
