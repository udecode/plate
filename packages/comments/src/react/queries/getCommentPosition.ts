import type { SlateEditor } from '@udecode/plate';

import clamp from 'lodash/clamp.js';

import type { TCommentText } from '../../lib/types';

import { getElementAbsolutePosition } from '../../lib';

export const getCommentPosition = (editor: SlateEditor, node: TCommentText) => {
  const DOMNode = editor.api.toDOMNode(node);

  if (!DOMNode) return;

  const DOMNodePosition = getElementAbsolutePosition(DOMNode);

  const editorDOMNode = editor.api.toDOMNode(editor);

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
