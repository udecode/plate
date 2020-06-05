import { Editor, Path, Point, Range, Transforms } from 'slate';
import { isRangeAtRoot } from '../../common/queries';
import { unwrapNodesByType } from '../../common/transforms';
import { withResetBlockType } from '../../handlers/reset-block-type';
import { PARAGRAPH } from '../paragraph';
import { ListType, WithListOptions } from './types';

export const withList = ({
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
  typeP = PARAGRAPH,
}: WithListOptions = {}) => <T extends Editor>(editor: T) => {
  const { insertBreak } = editor;

  /**
   * Add a new list item if selection is in a LIST_ITEM > typeP.
   */
  editor.insertBreak = () => {
    if (editor.selection && !isRangeAtRoot(editor.selection)) {
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

  const onResetListType = () => {
    unwrapNodesByType(editor, typeLi, { split: true });
    unwrapNodesByType(editor, [typeUl, typeOl], { split: true });
  };

  editor = withResetBlockType({
    types: [typeLi],
    defaultType: typeP,
    onUnwrap: onResetListType,
  })(editor);

  return editor;
};
