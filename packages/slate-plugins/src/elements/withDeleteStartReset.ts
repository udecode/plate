import { PARAGRAPH } from 'elements/paragraph';
import { Editor, Point, Range, Transforms } from 'slate';
import { ListType } from './list';

/**
 * On delete at the start of an empty block in types,
 * replace it with a new paragraph.
 */
export const withDeleteStartReset = ({
  types,
  unwrapTypes = [],
}: {
  types: string[];
  unwrapTypes?: string[];
}) => <T extends Editor>(editor: T) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => types.includes(n.type),
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);

        if (Point.equals(selection.anchor, start)) {
          Transforms.setNodes(editor, { type: PARAGRAPH });

          if (unwrapTypes.length) {
            Transforms.unwrapNodes(editor, {
              match: n => unwrapTypes.includes(n.type),
              split: true,
            });
          }
          return;
        }
      }
    }

    deleteBackward(...args);

    // temporary quick fix for list item
    const match = Editor.above(editor, {
      match: n => unwrapTypes.includes(n.type),
    });

    if (match) {
      Transforms.setNodes(editor, { type: ListType.LIST_ITEM });
    }
  };

  return editor;
};
