import type { TElement, TText } from '@platejs/slate';

import { IS_FIREFOX, NodeApi } from '@platejs/slate';
import isEqual from 'lodash/isEqual.js';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

export const getMarkBoundaryAffinity = (
  editor: SlateEditor,
  markBoundary: EdgeNodes
): 'backward' | 'forward' | undefined => {
  const { marks, selection } = editor;
  if (!selection) return;

  const marksMatchLeaf = (leaf: TElement | TText) =>
    marks &&
    isEqual(NodeApi.extractProps(leaf), marks) &&
    Object.keys(marks).length > 1;

  const [backwardLeafEntry, forwardLeafEntry] = markBoundary;

  if (!backwardLeafEntry || !forwardLeafEntry) {
    const leafEntry = backwardLeafEntry || forwardLeafEntry;
    const affinityIsTowardsLeaf = !marks || marksMatchLeaf(leafEntry[0]);

    if (affinityIsTowardsLeaf) {
      return leafEntry === backwardLeafEntry ? 'backward' : 'forward';
    }
    return;
  }

  const marksDirection: 'backward' | 'forward' | null =
    marks &&
    (() => {
      if (backwardLeafEntry && marksMatchLeaf(backwardLeafEntry[0]))
        return 'backward';
      if (forwardLeafEntry && marksMatchLeaf(forwardLeafEntry[0]))
        return 'forward';
      return null;
    })();

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
