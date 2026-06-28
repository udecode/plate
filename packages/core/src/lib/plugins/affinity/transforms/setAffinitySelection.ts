import type { Point } from 'slate';

import { ElementApi, NodeApi } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

export const setAffinitySelection = (
  editor: SlateEditor,
  edgeNodes: EdgeNodes,
  affinity: 'backward' | 'forward'
) => {
  const setMarks = (marks: typeof editor.marks) => {
    editor.marks = marks;
    editor.api.onChange();
  };

  const select = (point: Point) => {
    editor.tf.setSelection({ anchor: point, focus: point });
  };

  const [before, after] = edgeNodes;

  if (affinity === 'backward') {
    if (before === null) {
      setMarks({});
      return;
    }

    const beforeEnd = editor.api.end(before[1]);
    if (beforeEnd) {
      select(beforeEnd);
    }

    if (ElementApi.isElement(before[0])) return;
    setMarks(null);

    return;
  }

  if (before === null) {
    setMarks(null);
    return;
  }

  if (after === null) {
    setMarks({});
    return;
  }

  const beforeEnd = editor.api.end(before[1])!;
  select(beforeEnd);

  if (ElementApi.isElement(after[0])) {
    return;
  }
  setMarks(NodeApi.extractProps(after[0]));
};
