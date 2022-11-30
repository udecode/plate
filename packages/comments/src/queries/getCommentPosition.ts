import { PlateEditor, toDOMNode, Value } from '@udecode/plate-core';
import { clamp } from 'lodash';
import { TCommentText } from '../types';
import { getElementAbsolutePosition } from '../utils/getElementAbsolutePosition';

export const getCommentPosition = <V extends Value>(
  editor: PlateEditor<V>,
  node: TCommentText
) => {
  const threadDOMNode = toDOMNode(editor, node);
  if (!threadDOMNode) return;

  const threadDOMNodePosition = getElementAbsolutePosition(threadDOMNode);

  const editorDOMNode = toDOMNode(editor, editor);
  if (!editorDOMNode) return;

  const {
    x: editorX,
    width: editorWidth,
  } = editorDOMNode.getBoundingClientRect();

  const sideThreadWidth = 418;
  const padding = 16;

  return {
    left: clamp(
      editorX + editorWidth + 16,
      window.innerWidth - (sideThreadWidth + padding)
    ),
    top: threadDOMNodePosition.top,
  };
};
