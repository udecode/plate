import { PARAGRAPH } from 'elements/paragraph';
import { isRangeAtRoot } from 'elements/queries';
import { withBreakEmptyReset } from 'elements/withBreakEmptyReset';
import { withDeleteStartReset } from 'elements/withDeleteStartReset';
import { Editor, Path, Point, Range, Transforms } from 'slate';
import { ListType } from './types';

export const withList = <T extends Editor>(editor: T) => {
  const { insertBreak } = editor;

  /**
   * Add a new list item if selection is in a LIST_ITEM > PARAGRAPH.
   */
  editor.insertBreak = () => {
    if (editor.selection && !isRangeAtRoot(editor.selection)) {
      const [paragraphNode, paragraphPath] = Editor.parent(
        editor,
        editor.selection
      );
      if (paragraphNode.type === PARAGRAPH) {
        const [listItemNode, listItemPath] = Editor.parent(
          editor,
          paragraphPath
        );

        if (listItemNode.type === ListType.LIST_ITEM) {
          if (!Range.isCollapsed(editor.selection)) {
            Transforms.delete(editor);
          }

          const start = Editor.start(editor, paragraphPath);
          const end = Editor.end(editor, paragraphPath);

          const isStart = Point.equals(editor.selection.anchor, start);
          const isEnd = Point.equals(editor.selection.anchor, end);

          const nextParagraphPath = Path.next(paragraphPath);
          const nextListItemPath = Path.next(listItemPath);

          /**
           * If start, insert a list item before
           */
          if (isStart) {
            Transforms.insertNodes(
              editor,
              {
                type: ListType.LIST_ITEM,
                children: [{ type: PARAGRAPH, children: [{ text: '' }] }],
              },
              { at: listItemPath }
            );
            return;
          }

          /**
           * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
           */
          if (!isEnd) {
            Transforms.splitNodes(editor, { at: editor.selection });
            Transforms.wrapNodes(
              editor,
              {
                type: ListType.LIST_ITEM,
                children: [],
              },
              { at: nextParagraphPath }
            );
            Transforms.moveNodes(editor, {
              at: nextParagraphPath,
              to: nextListItemPath,
            });
          } else {
            /**
             * If end, insert a list item after and select it
             */
            Transforms.insertNodes(
              editor,
              {
                type: ListType.LIST_ITEM,
                children: [{ type: PARAGRAPH, children: [{ text: '' }] }],
              },
              { at: nextListItemPath }
            );
            Transforms.select(editor, nextListItemPath);
          }

          /**
           * If there is a list in the list item, move it to the next list item
           */
          if (listItemNode.children.length > 1) {
            Transforms.moveNodes(editor, {
              at: nextParagraphPath,
              to: nextListItemPath.concat(1),
            });
          }

          return;
        }
      }
    }

    insertBreak();
  };

  const withBreakEmptyList = () => {
    Transforms.unwrapNodes(editor, {
      match: (n) => n.type === ListType.LIST_ITEM,
      split: true,
    });
    Transforms.unwrapNodes(editor, {
      match: (n) => [ListType.UL_LIST, ListType.OL_LIST].includes(n.type),
      split: true,
    });
  };

  let e = withBreakEmptyReset({
    types: [ListType.LIST_ITEM],
    onUnwrap: withBreakEmptyList,
  })(editor);

  e = withDeleteStartReset({
    types: [ListType.LIST_ITEM],
    onUnwrap: withBreakEmptyList,
  })(e);

  return e;
};
