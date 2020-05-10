import { DEFAULT_ELEMENT } from 'element/types';
import { Editor, Point, Range, Transforms } from 'slate';

/**
 * On delete at the start of an empty block in types,
 * replace it with a new paragraph.
 */
export const withDeleteStartReset = ({
  typeP = DEFAULT_ELEMENT,
  types,
  onUnwrap,
}: {
  typeP?: string;
  types: string[];
  onUnwrap?: any;
}) => <T extends Editor>(editor: T) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const parent = Editor.above(editor, {
        match: (n) => types.includes(n.type as string),
      });

      if (parent) {
        const [, parentPath] = parent;
        const parentStart = Editor.start(editor, parentPath);

        if (Point.equals(selection.anchor, parentStart)) {
          Transforms.setNodes(editor, { type: typeP });

          onUnwrap?.();

          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
