import type { Path } from 'slate';

import { type TEditor, type TNode, setSelection } from '@udecode/slate';
import { findNodePath, focusEditor } from '@udecode/slate-react';
import {
  getNextNodeStartPoint,
  getPreviousNodeEndPoint,
} from '@udecode/slate-utils';

export const selectAroundNode = (
  editor: TEditor,
  {
    at,
    edge = 'end',
    focus = true,
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
