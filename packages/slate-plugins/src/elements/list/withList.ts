import { PARAGRAPH } from 'elements/paragraph';
import { withBreakEmptyReset } from 'elements/withBreakEmptyReset';
import { withDeleteStartReset } from 'elements/withDeleteStartReset';
import { Editor, Path, Point, Range, Transforms } from 'slate';
import { ListType, ListTypeOptions } from './types';

export const withList = ({
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
  typeP = PARAGRAPH,
}: ListTypeOptions = {}) => <T extends Editor>(editor: T) => {
  const options = {
    typeUl,
    typeOl,
    typeLi,
    typeP,
  };

  const { insertBreak } = editor;

  /**
   * Add a new list item if selection is in a LIST_ITEM > typeP.
   */
  editor.insertBreak = () => {
    if (editor.selection) {
      const [paragraphNode, paragraphPath] = Editor.parent(
        editor,
        editor.selection
      );
      if (paragraphNode.type === typeP) {
        const [listItemNode, listItemPath] = Editor.parent(
          editor,
          paragraphPath
        );

        if (listItemNode.type === typeLi) {
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
                type: typeLi,
                children: [{ type: typeP, children: [{ text: '' }] }],
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
                type: typeLi,
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
                type: typeLi,
                children: [{ type: typeP, children: [{ text: '' }] }],
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
      match: (n) => n.type === typeLi,
      split: true,
    });
    Transforms.unwrapNodes(editor, {
      match: (n) => [typeUl, typeOl].includes(n.type),
      split: true,
    });
  };

  let e = withBreakEmptyReset({
    ...options,
    types: [typeLi],
    onUnwrap: withBreakEmptyList,
  })(editor);

  e = withDeleteStartReset({
    ...options,
    types: [typeLi],
    onUnwrap: withBreakEmptyList,
  })(e);

  return e;
};
