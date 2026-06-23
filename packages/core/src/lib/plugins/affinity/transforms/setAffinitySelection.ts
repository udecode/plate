import { ElementApi, NodeApi, type Point } from '@platejs/plite';

import type { BasePlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

import { getCurrentRuntimeTransforms } from '../../../../internal/currentRuntimeBridge';

export const setAffinitySelection = (
  editor: BasePlateEditor,
  edgeNodes: EdgeNodes,
  affinity: 'backward' | 'forward'
) => {
  const setMarks = (marks: typeof editor.marks) => {
    editor.marks = marks;
    editor.api.onChange();
  };

  const select = (point: Point) => {
    getCurrentRuntimeTransforms(editor).setSelection({
      anchor: point,
      focus: point,
    });
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

  if (ElementApi.isElement(before[0])) {
    const afterStart = editor.api.start(after[1]);

    if (afterStart) {
      select(afterStart);
    }

    if (!ElementApi.isElement(after[0])) {
      setMarks(NodeApi.extractProps(after[0]));
    }
    return;
  }

  const beforeEnd = editor.api.end(before[1])!;
  select(beforeEnd);

  if (ElementApi.isElement(after[0])) {
    return;
  }
  setMarks(NodeApi.extractProps(after[0]));
};
