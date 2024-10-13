import type { Path } from 'slate';

import { type TEditor, type TNode, setSelection } from '@udecode/slate';
import { findNodePath, focusEditor } from '@udecode/slate-react';
import {
  getNextNodeStartPoint,
  getPreviousNodeEndPoint,
} from '@udecode/slate-utils';

export const selectSiblingNodePoint = (
  editor: TEditor,
  {
    at,
    focus = true,
    node,
    position = 'after',
  }: {
    at?: Path;
    focus?: boolean;
    node?: TNode;
    position?: 'after' | 'before';
  } = {}
) => {
  if (node) {
    at = findNodePath(editor, node);
  }
  if (!at) return;

  const point =
    position === 'before'
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
