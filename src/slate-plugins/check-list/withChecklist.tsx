import { Editor, Point, Range, Transforms } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const withChecklist = (editor: Editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === ElementType.CHECK_LIST_ITEM,
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);
        if (Point.equals(selection.anchor, start)) {
          Transforms.setNodes(
            editor,
            { type: ElementType.PARAGRAPH },
            { match: n => n.type === ElementType.CHECK_LIST_ITEM }
          );
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
