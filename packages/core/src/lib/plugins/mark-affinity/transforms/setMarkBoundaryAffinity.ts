import type { Point } from 'slate';

import { NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { MarkBoundary } from '../types';

export const setMarkBoundaryAffinity = (
  editor: SlateEditor,
  markBoundary: MarkBoundary,
  affinity: 'backward' | 'forward'
) => {
  const setMarks = (marks: typeof editor.marks) => {
    editor.marks = marks;
    editor.api.onChange();
  };

  const selectPoint = (point: Point) => {
    editor.tf.setSelection({ anchor: point, focus: point });
  };
  if (affinity === 'backward') {
    const [backwardLeafEntry] = markBoundary;
    if (backwardLeafEntry === null) return setMarks({});
    // TODO check type assertion
    const endOfBackward = editor.api.end(backwardLeafEntry[1])!;
    selectPoint(endOfBackward);
    setMarks(null);
    return;
  }

  const [backwardLeafEntry, forwardLeafEntry] = markBoundary;
  if (backwardLeafEntry === null) return setMarks(null);
  if (forwardLeafEntry === null) return setMarks({});

  const endOfBackward = editor.api.end(backwardLeafEntry[1])!;
  selectPoint(endOfBackward);

  setMarks(NodeApi.extractProps(forwardLeafEntry[0]));
};
