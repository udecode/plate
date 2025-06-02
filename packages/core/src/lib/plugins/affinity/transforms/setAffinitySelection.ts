import type { Point } from 'slate';

import { ElementApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

import { type ElementAffinity, AffinityPlugin } from '../AffinityPlugin';

export const setAffinitySelection = (
  editor: SlateEditor,
  edgeNodes: EdgeNodes,
  affinity: 'backward' | 'forward'
) => {
  const setElement = (elementAffinity: ElementAffinity | null) => {
    editor.setOption(AffinityPlugin, 'elementAffinity', elementAffinity);
  };

  const setMarks = (marks: typeof editor.marks) => {
    setElement(null);
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

    if (ElementApi.isElement(before[0])) {
      setElement({
        affinity,
        at: before[1],
        type: before[0].type,
      });
    } else {
      setMarks(null);
    }

    return;
  }

  if (before === null) {
    setMarks(null);
    setElement(null);
    return;
  }

  if (after === null) {
    setMarks({});
    setElement(null);
    return;
  }

  const beforeEnd = editor.api.start(after[1])!;
  select(beforeEnd);

  if (ElementApi.isElement(after[0])) {
    setElement({
      affinity,
      at: after[1],
      type: after[0].type,
    });
  } else {
    setMarks(null);
  }
};
