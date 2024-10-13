import type { Path } from 'slate';

import {
  type SlateEditor,
  type TNode,
  getNextNodeStartPoint,
  getPreviousNodeEndPoint,
  setSelection,
} from '@udecode/plate-common';
import { findNodePath, focusEditor } from '@udecode/plate-common/react';

export const selectAroundNode = (
  editor: SlateEditor,
  {
    at,
    edge = 'end',
    focus,
    node,
  }: {
    at?: Path;
    edge?: 'end' | 'start';
    focus?: boolean;
    node?: TNode;
  } = {}
) => {
  if (node) {
    at = findNodePath(editor, node);
  }
  if (!at) return;

  const point =
    edge === 'start'
      ? getPreviousNodeEndPoint(editor, at)
      : getNextNodeStartPoint(editor, at);

  if (!point) return;

  setSelection(editor, {
    anchor: point,
    focus: point,
  });

  if (focus) {
    focusEditor(editor);
  }
};
