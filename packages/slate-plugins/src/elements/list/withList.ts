import { Editor, Path, Point, Range, Transforms } from 'slate';
import { isRangeAtRoot } from '../../common/queries';
import { unwrapNodesByType } from '../../common/transforms';
import { setDefaults } from '../../common/utils/setDefaults';
import { withResetBlockType } from '../../handlers/reset-block-type';
import { DEFAULTS_LIST } from './defaults';
import { WithListOptions } from './types';

export const withList = (options?: WithListOptions) => <T extends Editor>(
  editor: T
) => {
  const { p, li, ul, ol } = setDefaults(options, DEFAULTS_LIST);

  const { insertBreak } = editor;

  /**
   * Add a new list item if selection is in a LIST_ITEM > p.type.
   */
  editor.insertBreak = () => {
    if (editor.selection && !isRangeAtRoot(editor.selection)) {
      const [paragraphNode, paragraphPath] = Editor.parent(
        editor,
        editor.selection
      );
      if (paragraphNode.type === p.type) {
        const [listItemNode, listItemPath] = Editor.parent(
          editor,
          paragraphPath
        );

        if (listItemNode.type === li.type) {
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
                type: li.type,
                children: [{ type: p.type, children: [{ text: '' }] }],
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
                type: li.type,
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
                type: li.type,
                children: [{ type: p.type, children: [{ text: '' }] }],
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
    unwrapNodesByType(editor, li.type, { split: true });
    unwrapNodesByType(editor, [ul.type, ol.type], { split: true });
  };

  editor = withResetBlockType({
    types: [li.type],
    defaultType: p.type,
    onUnwrap: onResetListType,
  })(editor);

  return editor;
};
