import { useMemo, type RefObject } from 'react';

import { getSelectionDOMRange } from '../../core/selection-protocol';
import type { Editor } from '../../index';
import { getSnapshot } from '../../interfaces/editor';
import {
  createRangeGeometryOwner,
  measureDOMElementsGeometry,
  measureRangeGeometry,
  type RangeGeometry,
  type RangeGeometryOwner,
  useRangeGeometryOwner,
} from '../range-geometry';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  subscribePliteViewSelection,
} from '../view-selection';
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
      measure: (view, editable) => {
        const viewSelection = readPliteViewSelection(view);

        if (viewSelection && !isPliteViewSelectionCollapsed(viewSelection)) {
          return measureDOMElementsGeometry(
            editable.querySelectorAll('[data-editor-view-selection="true"]')
          );
        }

        const selection = getSelectionDOMRange(
          view,
          getSnapshot(view).selection
        );

        return selection
          ? measureRangeGeometry(view, editable, selection)
          : null;
      },
      subscribe: (view, listener) => {
        const unsubscribeCommit = view.subscribeCommit((commit) => {
          if (commit.selectionChanged) listener();
        });
        const unsubscribeViewSelection = subscribePliteViewSelection(
          view,
          listener
        );

        return () => {
          unsubscribeCommit();
          unsubscribeViewSelection();
        };
      },
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
