import { PARAGRAPH } from 'elements/paragraph';
import { Editor, Point, Range, Transforms } from 'slate';
import { ACTION_ITEM } from './types';

export const withActionItem = <T extends Editor>(editor: T) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === ACTION_ITEM,
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);
        if (Point.equals(selection.anchor, start)) {
          Transforms.setNodes(
            editor,
            { type: PARAGRAPH },
            { match: n => n.type === ACTION_ITEM }
          );
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
