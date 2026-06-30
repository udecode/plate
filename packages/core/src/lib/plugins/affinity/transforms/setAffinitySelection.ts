import type { EditorUpdateTransaction, Point } from '@platejs/plite';
import type { BaseEditor } from '../../../editor';

import { ElementApi, NodeApi } from '@platejs/plite';

import type { EdgeNodes } from '../types';

export const setAffinitySelection = (
  editor: BaseEditor,
  edgeNodes: EdgeNodes,
  affinity: 'backward' | 'forward',
  tx: Pick<EditorUpdateTransaction, 'marks' | 'selection'>
) => {
  const select = (point: Point) => {
    tx.selection.set({ anchor: point, focus: point });
  };

  const [before, after] = edgeNodes;

  if (affinity === 'backward') {
    if (before === null) {
      tx.marks.set({});
      return;
    }

    const beforeEnd = editor.read.points.end(before[1]);
    if (beforeEnd) {
      select(beforeEnd);
    }

    if (ElementApi.isElement(before[0])) return;
    tx.marks.set(null);

    return;
  }

  if (before === null) {
    tx.marks.set(null);
    return;
  }

  if (after === null) {
    tx.marks.set({});
    return;
  }

  const beforeEnd = editor.read.points.end(before[1])!;
  select(beforeEnd);

  if (ElementApi.isElement(after[0])) {
    return;
  }
  tx.marks.set(NodeApi.extractProps(after[0]));
};
