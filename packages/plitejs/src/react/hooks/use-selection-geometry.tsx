import { useMemo, type RefObject } from 'react';

import { getSelectionDOMRange } from '../../core/selection-protocol';
import type { Editor } from '../../index';
import { getSnapshot } from '../../interfaces/editor';
import { resolveNativeViewSelectionDOMRange } from '../editable/selection-projected-dom';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  createRangeGeometryOwner,
  resolveDOMRangeGeometry,
  resolveRangeGeometry,
  type RangeGeometry,
  type RangeGeometryOwner,
  useRangeGeometryOwner,
} from '../range-geometry';
import {
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
        const selection = readPliteViewSelection(view);
        if (selection) {
          const range = resolveNativeViewSelectionDOMRange(
            view as ReactRuntimeEditor,
            selection,
            editable
          );
          if (!range) return null;
          const focus = range.cloneRange();
          focus.collapse(selection.segments.backward);
          return resolveDOMRangeGeometry(editable, range, focus, false);
        }
        const range = getSelectionDOMRange(view, getSnapshot(view).selection);
        return range ? resolveRangeGeometry(view, editable, range) : null;
      },
      subscribe: (view, listener) => {
        const unsubscribe = view.subscribeCommit((commit) => {
          if (commit.selectionChanged) listener();
        });
        const unsubscribeView = subscribePliteViewSelection(view, listener);
        return () => {
          unsubscribe();
          unsubscribeView();
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
