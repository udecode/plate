import { getNodeProps, PlateEditor, TText } from '@udecode/plate-common';
import isEqual from 'lodash/isEqual';

import { MarkBoundary } from './types';

const IS_FIREFOX = false;

export const getMarkBoundaryAffinity = (
  editor: PlateEditor,
  markBoundary: MarkBoundary
): 'forward' | 'backward' | 'new-mark' => {
  const { marks, selection } = editor;
  if (!selection) return 'new-mark';
  const marksMatchLeaf = (leaf: TText) =>
    marks && isEqual(getNodeProps(leaf), marks);
  const [backwardLeafEntry, forwardLeafEntry] = markBoundary;

  if (!backwardLeafEntry || !forwardLeafEntry) {
    const leafEntry = backwardLeafEntry || forwardLeafEntry;
    const affinityIsTowardsLeaf = !marks || marksMatchLeaf(leafEntry[0]);
    if (affinityIsTowardsLeaf) {
      return leafEntry === backwardLeafEntry ? 'backward' : 'forward';
    }
    return 'new-mark';
  }

  const marksDirection: 'forward' | 'backward' | null =
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
