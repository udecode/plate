import { Editor } from 'slate';
import { setDefaults } from '../../../common';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockLineOptions, CodeBlockOptions } from '../types';

export const insertCodeBlockLine = (
  editor: Editor,
  options?: CodeBlockOptions & CodeBlockLineOptions,
  indentDepth?: number
) => {
  const { code_block_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  if (editor.selection) {
    // determine where to insert the new line
    // insert it
    // indentCodeBlockLine() call indent depth / 2 ?
  }
};

/*
import { Editor, Path, Range, Transforms } from 'slate';
import { getAbove } from '../../../common/queries/getAbove';
import { getParent } from '../../../common/queries/getParent';
import { isBlockTextEmptyAfterSelection } from '../../../common/queries/isBlockTextEmptyAfterSelection';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';


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
      });
    } else {

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


    if (listItemNode.children.length > 1) {
      Transforms.moveNodes(editor, {
        at: nextParagraphPath,
        to: nextListItemPath.concat(1),
      });
    }

    return true;
  }

};

 */
