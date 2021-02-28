import { Editor, Path, Range, Transforms } from 'slate';
import { getAbove } from '../../../common/queries/getAbove';
import { getParent } from '../../../common/queries/getParent';
import { isBlockTextEmptyAfterSelection } from '../../../common/queries/isBlockTextEmptyAfterSelection';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * Insert list item if selection in li>p.
 * TODO: test
 */
export const insertListItem = (editor: Editor, options?: ListOptions) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);

  if (editor.selection) {
    const paragraphEntry = getAbove(editor, { match: { type: p.type } });
    if (!paragraphEntry) return;
    const [, paragraphPath] = paragraphEntry;

    const listItemEntry = getParent(editor, paragraphPath);
    if (!listItemEntry) return;
    const [listItemNode, listItemPath] = listItemEntry;

    if (listItemNode.type !== li.type) return;

    if (!Range.isCollapsed(editor.selection)) {
      Transforms.delete(editor);
    }

    const isStart = Editor.isStart(
      editor,
      editor.selection.focus,
      paragraphPath
    );
    const isEnd = isBlockTextEmptyAfterSelection(editor);

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
      return true;
    }

    /**
     * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
     */
    if (!isEnd) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor);
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
        Transforms.select(editor, nextListItemPath);
        Transforms.collapse(editor, {
          edge: 'start',
        });
      });
    } else {
      /**
       * If end, insert a list item after and select it
       */
      const marks = Editor.marks(editor) || {};
      Transforms.insertNodes(
        editor,
        {
          type: li.type,
          children: [{ type: p.type, children: [{ text: '', ...marks }] }],
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

    return true;
  }
};
