import {
  getPluginType,
  insertNodes,
  isCollapsed,
  PlateEditor,
  TElement,
  unwrapNodes,
} from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_COMMENT } from '../createCommentsPlugin';
import { wrapComment } from './wrapComment';

/**
 * Unwrap link at a location (default: selection).
 * Then, the focus of the location is set to selection focus.
 * Then, wrap the link at the location.
 */
export const upsertCommentAtSelection = <T = {}>(
  editor: PlateEditor<T>,
  {
    comment,
    wrap,
  }: {
    comment: any;
    /**
     * If true, wrap the link at the location (default: selection) even if the selection is collapsed.
     */
    wrap?: boolean;
  }
) => {
  if (!editor.selection) return;

  const type = getPluginType(editor, ELEMENT_COMMENT);

  if (!wrap && isCollapsed(editor.selection)) {
    return insertNodes<TElement>(editor, {
      type,
      comment,
      children: [{ text: comment }],
    });
  }

  // if our cursor is inside an existing comment, but don't have the text selected, select it now
  if (wrap && isCollapsed(editor.selection)) {
    const commentLeaf = Editor.leaf(editor, editor.selection);
    const [, inlinePath] = commentLeaf;
    Transforms.select(editor, inlinePath);
  }

  unwrapNodes(editor, { at: editor.selection, match: { type } });

  wrapComment(editor, { at: editor.selection, comment });

  Transforms.collapse(editor, { edge: 'end' });
};
