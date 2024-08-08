import type { PlateEditor } from '@udecode/plate-common/server';

import { toDOMNode } from '@udecode/plate-common';
import clamp from 'lodash/clamp.js';

import type { TCommentText } from '../types';

import { getElementAbsolutePosition } from '../utils/getElementAbsolutePosition';

export const getCommentPosition = (editor: PlateEditor, node: TCommentText) => {
  const DOMNode = toDOMNode(editor, node);

  if (!DOMNode) return;

  const DOMNodePosition = getElementAbsolutePosition(DOMNode);

  const editorDOMNode = toDOMNode(editor, editor);

  if (!editorDOMNode) return;

  const { width: editorWidth, x: editorX } =
    editorDOMNode.getBoundingClientRect();

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
