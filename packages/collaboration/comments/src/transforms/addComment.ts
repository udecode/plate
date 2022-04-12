import {
  getAbove,
  getPluginType,
  isCollapsed,
  PlateEditor,
  unwrapNodes,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';
import { ELEMENT_COMMENT } from '../createCommentsPlugin';
import { upsertCommentAtSelection } from './upsertCommentAtSelection';

function determineAbsolutePosition(
  element: any
): { left: number; top: number } {
  let left = 0;
  let top = 0;
  do {
    left += element.offsetLeft || 0;
    top += element.offsetTop || 0;
    element = element.offsetParent;
  } while (element);
  return {
    left,
    top,
  };
}

export async function addComment(
  editor: PlateEditor,
  getComment?: (prevComment: string) => string
) {
  const a = Editor.node(editor, editor.selection);
  console.log('aa', a);
  // @ts-ignore
  const domNode = ReactEditor.toDOMNode(editor, a[0]);
  console.log(domNode);
  const position = determineAbsolutePosition(domNode);
  console.log('posito', position);

  const editorDOMNode = ReactEditor.toDOMNode(editor, editor);
  console.log('editorDOMNode', editorDOMNode);

  const editorWidth = editorDOMNode.getBoundingClientRect().width;
  console.log('editorWidth', editorWidth);
  return;
  // @ts-ignore
  console.log(Editor.leaf(editor, editor.selection));
  // @ts-ignore
  // console.log(findDOMNode(Editor.leaf(editor, editor.selection)[0]));

  const type = getPluginType(editor, ELEMENT_COMMENT);
  let previousComment = '';

  const commentNode = getAbove(editor, {
    match: { type },
  });
  if (commentNode) {
    previousComment = commentNode[0].comment as string;
  }

  let comment;
  if (getComment) {
    comment = await getComment!(previousComment);
  } else {
    comment = window.prompt(`Comment:`, previousComment);
  }

  if (comment) {
    const shouldWrap: boolean =
      commentNode !== undefined && isCollapsed(editor.selection);
    upsertCommentAtSelection(editor, { comment, wrap: shouldWrap });
  } else if (commentNode && editor.selection) {
    unwrapNodes(editor, {
      at: editor.selection,
      match: { type: getPluginType(editor, ELEMENT_COMMENT) },
    });
  }
}
