import {
  getAbove,
  getParent,
  isBlockTextEmptyAfterSelection,
} from '@udecode/slate-plugins-common';
import { getPluginType, isElement } from '@udecode/slate-plugins-core';
import { Editor, Path, Range, Transforms } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../paragraph/defaults';
import { ELEMENT_LI } from '../defaults';

/**
 * Insert list item if selection in li>p.
 * TODO: test
 */
export const insertListItem = (editor: Editor) => {
  const liType = getPluginType(editor, ELEMENT_LI);
  const pType = getPluginType(editor, ELEMENT_PARAGRAPH);

  if (editor.selection) {
    const paragraphEntry = getAbove(editor, { match: { type: pType } });
    if (!paragraphEntry) return;
    const [, paragraphPath] = paragraphEntry;

    const listItemEntry = getParent(editor, paragraphPath);
    if (!listItemEntry) return;
    const [listItemNode, listItemPath] = listItemEntry;

    if (isElement(listItemNode) && listItemNode.type !== liType) return;

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
          type: liType,
          children: [{ type: pType, children: [{ text: '' }] }],
        } as any,
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
            type: liType,
            children: [],
          } as any,
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
          type: liType,
          children: [{ type: pType, children: [{ text: '', ...marks }] }],
        } as any,
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
