import { getEndPoint, getNodeProps, PlateEditor } from '@udecode/plate-common';
import { Point } from 'slate';

import { MarkBoundary } from '../types';

export const setMarkBoundaryAffinity = (
  editor: PlateEditor,
  markBoundary: MarkBoundary,
  affinity: 'forward' | 'backward'
) => {
  const setMarks = (marks: typeof editor.marks) => {
    editor.marks = marks;
    editor.onChange();
  };

  const selectPoint = (point: Point) => {
    editor.setSelection({ anchor: point, focus: point });
  };
  if (affinity === 'backward') {
    const [backwardLeafEntry] = markBoundary;
    if (backwardLeafEntry === null) return setMarks(null);
    const endOfBackward = getEndPoint(editor, backwardLeafEntry[1]);
    selectPoint(endOfBackward);
    setMarks(null);
    return;
  }

  const [backwardLeafEntry, forwardLeafEntry] = markBoundary;
  if (backwardLeafEntry === null) return setMarks(null);
  if (forwardLeafEntry === null) return setMarks({});

  const endOfBackward = getEndPoint(editor, backwardLeafEntry[1]);
  selectPoint(endOfBackward);
  setMarks(getNodeProps(forwardLeafEntry[0]));
};
