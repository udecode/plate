import { useMemo, type RefObject } from 'react';

import { getSelectionDOMRange } from '../../core/selection-protocol';
import type { Editor } from '../../index';
import { getSnapshot } from '../../interfaces/editor';
import {
  createRangeGeometryOwner,
  type RangeGeometry,
  type RangeGeometryOwner,
  useRangeGeometryOwner,
} from '../range-geometry';
import { useEditorContext } from './use-editor-context';

/** Identifies the exact mounted Editable used to resolve selection geometry. */
export type UseSelectionGeometryOptions = Readonly<{
  editableRef: RefObject<HTMLElement | null>;
}>;

export const createSelectionGeometryOwner = (
  editor: Editor,
  editableRef: RefObject<HTMLElement | null>
): RangeGeometryOwner =>
  createRangeGeometryOwner(
    editor,
    {
      read: (view) => getSelectionDOMRange(view, getSnapshot(view).selection),
      subscribe: (view, listener) =>
        view.subscribeCommit((commit) => {
          if (commit.selectionChanged) listener();
        }),
    },
    editableRef
  );

/** Read geometry for the current selection in one exact Editable. */
export function useSelectionGeometry({
  editableRef,
}: UseSelectionGeometryOptions): RangeGeometry | null {
  const editor = useEditorContext();
  const owner = useMemo(
    () => createSelectionGeometryOwner(editor, editableRef),
    [editableRef, editor]
  );

  return useRangeGeometryOwner(owner);
}
