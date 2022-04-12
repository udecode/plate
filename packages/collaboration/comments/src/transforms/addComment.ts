import {
  getAbove,
  getPluginType,
  isCollapsed,
  PlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_COMMENT } from '../createCommentsPlugin';
import { upsertCommentAtSelection } from './upsertCommentAtSelection';

export async function addComment(editor: PlateEditor, comment: string) {
  const type = getPluginType(editor, ELEMENT_COMMENT);
  const commentNode = getAbove(editor, {
    match: { type },
  });
  const shouldWrap: boolean =
    commentNode !== undefined && isCollapsed(editor.selection);
  upsertCommentAtSelection(editor, { comment, wrap: shouldWrap });
}
