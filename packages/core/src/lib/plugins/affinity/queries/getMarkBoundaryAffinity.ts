import type { Element, Text } from '@platejs/plite';

import { NodeApi } from '@platejs/plite';
import { IS_FIREFOX } from '@platejs/plite-dom';
import isEqual from 'lodash/isEqual.js';

import type { BaseEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

export const getMarkBoundaryAffinity = (
  editor: BaseEditor,
  markBoundary: EdgeNodes
): 'backward' | 'forward' | undefined => {
  const selection = editor.read.selection();
  if (!selection) return;

  const currentMarks = editor.read.marks();
  const boundaryMarks =
    currentMarks && Object.keys(currentMarks).length > 1 ? currentMarks : null;

  const marksMatchLeaf = (leaf: Element | Text) =>
    Boolean(
      boundaryMarks && isEqual(NodeApi.extractProps(leaf), boundaryMarks)
    );

  const [backwardLeafEntry, forwardLeafEntry] = markBoundary;

  if (!backwardLeafEntry || !forwardLeafEntry) {
    const leafEntry = backwardLeafEntry || forwardLeafEntry;
    const affinityIsTowardsLeaf =
      !boundaryMarks || marksMatchLeaf(leafEntry[0]);

    if (affinityIsTowardsLeaf) {
      return leafEntry === backwardLeafEntry ? 'backward' : 'forward';
    }
    return;
  }

  const marksDirection: 'backward' | 'forward' | null = boundaryMarks
    ? (() => {
        if (backwardLeafEntry && marksMatchLeaf(backwardLeafEntry[0]))
          return 'backward';
        if (forwardLeafEntry && marksMatchLeaf(forwardLeafEntry[0]))
          return 'forward';
        return null;
      })()
    : null;

  const selectionDirection =
    selection.anchor.offset === 0 ? 'forward' : 'backward';

  if (selectionDirection === 'backward' && marksDirection === 'forward')
    return 'forward';

  if (
    IS_FIREFOX &&
    selectionDirection === 'forward' &&
    marksDirection !== 'backward'
  )
    return 'forward';

  return 'backward';
};
