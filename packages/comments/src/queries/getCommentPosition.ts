import { PlateEditor, toDOMNode, Value } from '@udecode/plate-common';
import { clamp } from 'lodash';
import { TCommentText } from '../types';
import { getElementAbsolutePosition } from '../utils/getElementAbsolutePosition';

export const getCommentPosition = <V extends Value>(
  editor: PlateEditor<V>,
  node: TCommentText
) => {
  const DOMNode = toDOMNode(editor, node);
  if (!DOMNode) return;

  const DOMNodePosition = getElementAbsolutePosition(DOMNode);

  const editorDOMNode = toDOMNode(editor, editor);
  if (!editorDOMNode) return;

  const {
    x: editorX,
    width: editorWidth,
  } = editorDOMNode.getBoundingClientRect();

  const sidebarWidth = 418;
  const padding = 16;

  return {
    left: clamp(
      editorX + editorWidth + 16,
      window.innerWidth - (sidebarWidth + padding)
    ),
    top: DOMNodePosition.top,
  };
};
