import type { Point } from 'slate';

import { ElementApi, NodeApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { Boundary } from '../types';

import {
  type ElementAffinity,
  AffinityPlugin,
} from '../AffinityPlugin';

export const setMarkBoundaryAffinity = (
  editor: SlateEditor,
  markBoundary: Boundary,
  affinity: 'backward' | 'forward'
) => {
  const setMarks = (marks: typeof editor.marks) => {
    setElement(null);
    editor.marks = marks;
    editor.api.onChange();
  };

  const setElement = (elementAffinity: ElementAffinity | null) => {
    editor.setOption(AffinityPlugin, 'elementAffinity', elementAffinity);
  };

  const selectPoint = (point: Point) => {
    editor.tf.setSelection({ anchor: point, focus: point });
  };
  if (affinity === 'backward') {
    const [backwardLeafEntry] = markBoundary;

    if (backwardLeafEntry === null) {
      setMarks({});
      return;
    }

    const endOfBackward = editor.api.end(backwardLeafEntry[1]);
    endOfBackward && selectPoint(endOfBackward);

    ElementApi.isElement(backwardLeafEntry[0])
      ? setElement({
          affinity,
          at: backwardLeafEntry[1],
          type: backwardLeafEntry[0].type,
        })
      : setMarks(null);

    return;
  }

  const [backwardLeafEntry, forwardLeafEntry] = markBoundary;
  if (backwardLeafEntry === null) {
    setMarks(null);
    setElement(null);
    return;
  }

  if (forwardLeafEntry === null) {
    setMarks({});
    setElement(null);
    return;
  }

  const endOfBackward = editor.api.end(backwardLeafEntry[1])!;
  selectPoint(endOfBackward);

  ElementApi.isElement(forwardLeafEntry[0])
    ? setElement({
        affinity,
        at: forwardLeafEntry[1],
        type: forwardLeafEntry[0].type,
      })
    : setMarks(NodeApi.extractProps(forwardLeafEntry[0]));
};
