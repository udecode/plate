import { PARAGRAPH } from 'elements/paragraph';
import { Editor, Point, Range, Transforms } from 'slate';
import { ACTION_ITEM } from './types';

export const withActionItem = <T extends Editor>(editor: T) => {
  const { deleteBackward, insertBreak } = editor;

  /**
   * Pressing enter on:
   * - an empty block (except paragraph) replaces it with a new paragraph. Unwrap action item.
   * - an action item block, add a new one
   * TODO: same for list
   */
  editor.insertBreak = () => {
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    });

    if (match) {
      const [matchingNode] = match;
      if (matchingNode.type !== PARAGRAPH) {
        if (
          matchingNode.children[matchingNode.children.length - 1].text
            .length === 0
        ) {
          Transforms.setNodes(editor, { type: PARAGRAPH });
          Transforms.unwrapNodes(editor, {
            match: n => n.type === ACTION_ITEM,
            split: true,
          });
          return;
        }
        // if action item, add a new one
        if (matchingNode.type === ACTION_ITEM) {
          const checklist = {
            type: ACTION_ITEM,
            checked: false,
            children: [{ text: '' }],
          };
          Transforms.insertNodes(editor, checklist);
          return;
        }
      }
    }

    insertBreak();
  };

  /**
   * If at the start of an action item (not selected),
   * set to paragraph
   */
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
          Transforms.setNodes(editor, { type: PARAGRAPH });
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
