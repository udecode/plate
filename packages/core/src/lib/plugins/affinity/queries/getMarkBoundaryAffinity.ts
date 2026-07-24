import type { EditorStateView, Element, Text } from '@platejs/plite';

import { NodeApi } from '@platejs/plite';
import { findEditorDOMRootRuntime } from '@platejs/plite-dom/internal';
import isEqual from 'lodash/isEqual.js';

import type { BaseEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

export const getMarkBoundaryAffinity = (
  editor: BaseEditor,
  markBoundary: EdgeNodes,
  state: Pick<EditorStateView, 'marks' | 'selection'> = editor.read
): 'backward' | 'forward' | undefined => {
  const selection = state.selection();
  if (!selection) return;

  const currentMarks = state.marks();
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
    findEditorDOMRootRuntime(editor)?.isGeckoHost &&
    selectionDirection === 'forward' &&
    marksDirection !== 'backward'
  )
    return 'forward';

  return 'backward';
};
