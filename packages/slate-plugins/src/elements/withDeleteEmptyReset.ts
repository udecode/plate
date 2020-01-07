import { PARAGRAPH } from 'elements/paragraph';
import { Editor, Point, Range, Transforms } from 'slate';

/**
 * On delete at the start of an empty block in types,
 * replace it with a new paragraph.
 */
export const withDeleteEmptyReset = ({ types }: { types: string[] }) => <
  T extends Editor
>(
  editor: T
) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n => types.includes(n.type),
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);
        if (Point.equals(selection.anchor, start)) {
          return Transforms.setNodes(editor, { type: PARAGRAPH });
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
