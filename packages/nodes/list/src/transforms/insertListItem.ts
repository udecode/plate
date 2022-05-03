import {
  getAboveNode,
  getParentNode,
  getPluginType,
  insertNodes,
  isBlockTextEmptyAfterSelection,
  PlateEditor,
  TElement,
  Value,
  wrapNodes,
} from '@udecode/plate-core';
import { Editor, Path, Range, Transforms } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../createListPlugin';

/**
 * Insert list item if selection in li>p.
 * TODO: test
 */
export const insertListItem = <V extends Value>(
  editor: PlateEditor<V>
): boolean => {
  const liType = getPluginType(editor, ELEMENT_LI);
  const licType = getPluginType(editor, ELEMENT_LIC);

  if (!editor.selection) {
    return false;
  }

  const licEntry = getAboveNode(editor, { match: { type: licType } });
  if (!licEntry) return false;
  const [, paragraphPath] = licEntry;

  const listItemEntry = getParentNode(editor, paragraphPath);
  if (!listItemEntry) return false;
  const [listItemNode, listItemPath] = listItemEntry;

  if (listItemNode.type !== liType) return false;

  let success = false;

  Editor.withoutNormalizing(editor, () => {
    if (!Range.isCollapsed(editor.selection!)) {
      Transforms.delete(editor);
    }

    const isStart = Editor.isStart(
      editor,
      editor.selection!.focus,
      paragraphPath
    );
    const isEnd = isBlockTextEmptyAfterSelection(editor);

    const nextParagraphPath = Path.next(paragraphPath);
    const nextListItemPath = Path.next(listItemPath);

    /**
     * If start, insert a list item before
     */
    if (isStart) {
      insertNodes<TElement>(
        editor,
        {
          type: liType,
          children: [{ type: licType, children: [{ text: '' }] }],
        },
        { at: listItemPath }
      );

      success = true;

      return;
    }

    /**
     * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
     */
    if (!isEnd) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor);
        wrapNodes(
          editor,
          {
            type: liType,
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
      insertNodes<TElement>(
        editor,
        {
          type: liType,
          children: [{ type: licType, children: [{ text: '', ...marks }] }],
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

    success = true;
  });

  return success;
};
