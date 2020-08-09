import { Editor, Path, Range, Transforms } from 'slate';
import { getAboveByType } from '../../../common/queries/getAboveByType';
import { isBlockTextEmptyAfterSelection } from '../../../common/queries/isBlockTextEmptyAfterSelection';
import { isRangeAtRoot } from '../../../common/queries/isRangeAtRoot';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * Insert list item if selection in li>p.
 */
export const insertListItem = (editor: Editor, options?: ListOptions) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);

  if (editor.selection && !isRangeAtRoot(editor.selection)) {
    const paragraphEntry = getAboveByType(editor, p.type);
    if (!paragraphEntry) return;
    const [, paragraphPath] = paragraphEntry;

    const [listItemNode, listItemPath] = Editor.parent(editor, paragraphPath);
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

    return true;
  }
};
