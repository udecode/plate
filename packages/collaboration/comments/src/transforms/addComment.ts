import {
  getAbove,
  getPluginType,
  isCollapsed,
  PlateEditor,
  unwrapNodes,
} from '@udecode/plate-core';
import { ELEMENT_COMMENT } from '../createCommentsPlugin';
import { upsertCommentAtSelection } from './upsertCommentAtSelection';

export async function addComment(
  editor: PlateEditor,
  getComment?: (prevComment: string) => string
) {
  const type = getPluginType(editor, ELEMENT_COMMENT);
  let prevComment = '';

  const commentNode = getAbove(editor, {
    match: { type },
  });
  if (commentNode) {
    prevComment = commentNode[0].comment as string;
  }

  let comment;
  if (getComment) {
    comment = await getComment!(prevComment);
  } else {
    comment = window.prompt(`Comment:`, prevComment);
  }

  if (!comment) {
    commentNode &&
      editor.selection &&
      unwrapNodes(editor, {
        at: editor.selection,
        match: { type: getPluginType(editor, ELEMENT_COMMENT) },
      });

    return;
  }

  // If our cursor is in middle of a link, then we don't want to insert it inline
  const shouldWrap: boolean =
    commentNode !== undefined && isCollapsed(editor.selection);
  upsertCommentAtSelection(editor, { comment, wrap: shouldWrap });
}
