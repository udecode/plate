import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

import type { NamedRootKey } from '../..';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import {
  type PresentationRootAreasSnapshot,
  readNestedRootView,
  readPresentationRootAreas,
  subscribePresentationRootAreas,
} from '../../core/root-target';
import { getViewPresentation } from '../../editor-runtime-view';
import type { AnyEditor } from '../editable/runtime-editor-api';

/** Standalone editing areas mounted in a view's presentation. */
export type EditorRootAreas<TEditor extends AnyEditor = AnyEditor> = Readonly<{
  /** Whether this view is the active shown standalone editing area for its root in this presentation. */
  isPrimaryForRoot: boolean;
  /** Return the mounted view of a nested content root inside this editing area, if one is mounted. */
  nestedView: (root: NamedRootKey) => TEditor | null;
  /** Named roots that currently have their own shown standalone editing area in this presentation. */
  standaloneRoots: readonly NamedRootKey[];
}>;

const EMPTY_SNAPSHOT: PresentationRootAreasSnapshot = Object.freeze({
  isPrimaryForRoot: true,
  standaloneRoots: Object.freeze([]),
});

const sameRootAreas = (
  left: PresentationRootAreasSnapshot,
  right: PresentationRootAreasSnapshot
) =>
  left.isPrimaryForRoot === right.isPrimaryForRoot &&
  left.standaloneRoots.length === right.standaloneRoots.length &&
  left.standaloneRoots.every(
    (root, index) => root === right.standaloneRoots[index]
  );

/**
 * Subscribe to the standalone editing areas mounted in this view's
 * presentation, and whether this view is the active standalone area for its
 * root.
 */
export function useEditorRootAreas<TEditor extends AnyEditor = AnyEditor>(
  editor: TEditor
): EditorRootAreas<TEditor> {
  const cacheRef = useRef<PresentationRootAreasSnapshot>(EMPTY_SNAPSHOT);

  const subscribe = useCallback(
    (listener: () => void) => subscribePresentationRootAreas(editor, listener),
    [editor]
  );
  const getSnapshot = useCallback(() => {
    const next = readPresentationRootAreas(editor);

    if (sameRootAreas(cacheRef.current, next)) return cacheRef.current;

    const frozen: PresentationRootAreasSnapshot = Object.freeze({
      isPrimaryForRoot: next.isPrimaryForRoot,
      standaloneRoots: Object.freeze([...next.standaloneRoots]),
    });

    cacheRef.current = frozen;

    return frozen;
  }, [editor]);

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_SNAPSHOT
  );

  const nestedView = useCallback(
    (root: NamedRootKey) =>
      readNestedRootView(
        getEditorRuntimeOwner(editor),
        getViewPresentation(editor),
        root,
        editor
      ) as TEditor | null,
    [editor]
  );

  return useMemo(
    () =>
      Object.freeze({
        isPrimaryForRoot: snapshot.isPrimaryForRoot,
        nestedView,
        standaloneRoots: snapshot.standaloneRoots,
      }),
    [nestedView, snapshot]
  );
}
