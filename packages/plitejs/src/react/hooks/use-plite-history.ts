import { type KeyboardEvent, useCallback, useMemo, useRef } from 'react';

import {
  type EditorStateView,
  type NamedRootKey,
  type RootKey,
  SelectionApi,
} from '../..';
import { getMountedEditableDOMRuntime } from '../editable/editable-dom-runtime';
import { resolveHistoryFocusEditor } from '../editable/history-focus';
import {
  getHistoryDirectionFromNativeEvent,
  type HistoryDirection,
} from '../editable/history-keyboard';
import {
  failInvariant,
  getInternalDocumentChangeRootKeys,
  getEditorRuntimeOwner,
  runTrustedUpdate,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import type { Editor } from '../plugin/with-react';
import { MAIN_ROOT_KEY, toPublicRootOption } from '../root-key';
import { PLITE_REACT_PRESERVE_SELECTION_TAGS } from '../update-policy';
import {
  readPliteViewSelection,
  readPliteViewSelectionHistoryEntry,
  writePliteViewSelection,
} from '../view-selection';
import { focusPliteEditableAfterEventFrame } from './focus-plite-editable';
import { useEditorRuntimeState } from './use-editor-runtime-state';
import { useEditorViewState } from './use-editor-view-state';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import {
  createPliteRootEditor,
  useOptionalPliteRuntimeContext,
} from './use-plite-runtime';

/** Focus behavior after undo or redo commands. */
export type PliteHistoryFocusPolicy = 'none' | 'preserve' | 'restore-root';

/** Options for history commands and shortcut handling. */
export type UsePliteHistoryOptions<TRoot extends RootKey = RootKey> = {
  focusPolicy?: PliteHistoryFocusPolicy;
} & (
  | {
      /** Bind commands and focus to this existing view, including outside Plite. */
      editor: Editor<any, any>;
      root?: never;
    }
  | {
      editor?: undefined;
      root?: NamedRootKey<TRoot>;
    }
);

/** Undo/redo state and command handlers for one Plite root. */
export type PliteHistoryController = {
  canRedo: boolean;
  canUndo: boolean;
  onKeyDown: (event: KeyboardEvent) => void;
  redo: () => void;
  root: RootKey | undefined;
  undo: () => void;
};

type HistoryAvailability = {
  canRedo: boolean;
  canUndo: boolean;
};

const PENDING_HISTORY_FOCUS_RESTORES = new WeakMap<object, () => void>();

const historyAvailabilityEquality = (
  a: HistoryAvailability | null,
  b: HistoryAvailability
) => a?.canRedo === b.canRedo && a.canUndo === b.canUndo;

const nullableRootKeyEquality = (a: RootKey | null, b: RootKey | null) =>
  a === b;

const selectSelectionRoot = (
  state: EditorStateView<any, any>
): RootKey | null => {
  const selection = state.selection();

  if (!selection) {
    return null;
  }

  return SelectionApi.root(selection) ?? MAIN_ROOT_KEY;
};

const selectLastCommitSingleChangedRoot = (
  state: EditorStateView<any, any>
): RootKey | null => {
  const commit = state.lastCommit();
  const roots = new Set<RootKey>([
    ...(commit ? getInternalDocumentChangeRootKeys(commit.changes) : []),
    ...(commit?.changes.createRoots ?? []),
    ...(commit?.changes.deleteRoots ?? []),
  ]);

  return roots.size === 1 ? (roots.values().next().value ?? null) : null;
};

const createHistoryRootSelector = (initialRoot: RootKey) => {
  let lastRoot = initialRoot;

  return (state: EditorStateView<any, any>): RootKey => {
    const selectionRoot = selectSelectionRoot(state);

    if (selectionRoot) {
      lastRoot = selectionRoot;
    }

    return selectionRoot ?? lastRoot;
  };
};

const hasHistoryCommands = (
  tx: unknown
): tx is {
  history: {
    redo: () => void;
    undo: () => void;
  };
} =>
  typeof (tx as { history?: { redo?: unknown } }).history?.redo ===
    'function' &&
  typeof (tx as { history?: { undo?: unknown } }).history?.undo === 'function';

const getHistoryStacks = (
  state: unknown
): {
  redos: () => readonly unknown[];
  undos: () => readonly unknown[];
} | null => {
  const { history } = state as {
    history?: {
      redos?: () => readonly unknown[];
      undos?: () => readonly unknown[];
    };
  };
  const redos = history?.redos;
  const undos = history?.undos;

  return typeof redos === 'function' && typeof undos === 'function'
    ? { redos, undos }
    : null;
};

const selectHistoryAvailability = (state: unknown): HistoryAvailability => {
  const history = getHistoryStacks(state);

  return {
    canRedo: (history?.redos().length ?? 0) > 0,
    canUndo: (history?.undos().length ?? 0) > 0,
  };
};

/**
 * Create undo/redo commands and keyboard handling for the active or fixed root.
 *
 * The controller follows the current selection root by default, or a fixed
 * `root` when provided. Use `canUndo` / `canRedo` for disabled UI, wire
 * `onKeyDown` to editor chrome that owns shortcuts, and choose `focusPolicy`
 * based on whether undo/redo should restore editor focus.
 */
export function usePliteHistory<const TRoot extends RootKey = RootKey>({
  editor: providedEditor,
  focusPolicy = 'restore-root',
  root: fixedRoot,
}: UsePliteHistoryOptions<TRoot> = {}): PliteHistoryController {
  if (fixedRoot === MAIN_ROOT_KEY) {
    throw new Error(
      '[Plite] Omit root to bind history to the primary document.'
    );
  }

  const context = useOptionalPliteRuntimeContext();
  const source =
    providedEditor ??
    context?.runtime.editor ??
    failInvariant('usePliteHistory requires an editor or Plite provider.');
  const historyRootSelector = useMemo(
    () => createHistoryRootSelector(toInternalRoot(source.read.view.root())),
    [source]
  );
  const historyRoot = useEditorRuntimeState(source, historyRootSelector, {
    equalityFn: nullableRootKeyEquality,
    shouldUpdate: (change) => Boolean(change?.selectionChanged),
  });
  const root = providedEditor
    ? toInternalRoot(providedEditor.read.view.root())
    : (fixedRoot ?? historyRoot);
  const publicRoot = toPublicRootOption(root);
  const editor = useMemo(
    () =>
      providedEditor ??
      createPliteRootEditor(
        context ?? failInvariant('Expected a Plite runtime.'),
        publicRoot
      ),
    [context, providedEditor, publicRoot]
  );
  const {
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
  } = context ?? {};
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());
  const availability = useEditorRuntimeState(
    source,
    selectHistoryAvailability,
    {
      equalityFn: historyAvailabilityEquality,
    }
  );
  const pendingRestore = useRef<(() => void) | null>(null);
  useIsomorphicLayoutEffect(
    () => () => {
      const cancel = pendingRestore.current;
      cancel?.();
      const owner = getEditorRuntimeOwner(source);
      if (PENDING_HISTORY_FOCUS_RESTORES.get(owner) === cancel) {
        PENDING_HISTORY_FOCUS_RESTORES.delete(owner);
      }
      pendingRestore.current = null;
    },
    // Ambient undo can change roots without retiring the control's editor target.
    [fixedRoot, source]
  );

  const applyHistory = useCallback(
    (direction: HistoryDirection) => {
      if (editor.read.view.isReadOnly()) return;
      if (direction === 'undo' && !availability.canUndo) {
        return;
      }
      if (direction === 'redo' && !availability.canRedo) {
        return;
      }

      const viewSelectionAfterHistory = readPliteViewSelectionHistoryEntry(
        editor,
        direction
      );
      const previousViewSelection = readPliteViewSelection(editor);
      const runtimeOwner = getEditorRuntimeOwner(editor);
      let applied = false;

      PENDING_HISTORY_FOCUS_RESTORES.get(runtimeOwner)?.();
      PENDING_HISTORY_FOCUS_RESTORES.delete(runtimeOwner);
      writePliteViewSelection(editor, viewSelectionAfterHistory ?? null);
      try {
        runTrustedUpdate(
          editor,
          (tx) => {
            if (!hasHistoryCommands(tx)) {
              return;
            }

            tx.history[direction]();
            applied = true;
          },
          {
            tags:
              focusPolicy === 'preserve'
                ? PLITE_REACT_PRESERVE_SELECTION_TAGS
                : undefined,
          }
        );
      } catch (error) {
        writePliteViewSelection(editor, previousViewSelection);
        throw error;
      }

      if (!applied) {
        writePliteViewSelection(editor, previousViewSelection);
        return;
      }

      if (focusPolicy === 'restore-root') {
        const schedulerEditor =
          (providedEditor
            ? editor
            : (getMountedViewEditor?.(MAIN_ROOT_KEY) ??
              getMountedViewEditor?.(root))) ?? editor;
        const domPhaseScheduler =
          getMountedEditableDOMRuntime(schedulerEditor)?.domPhaseScheduler;
        const restoreFocus = () => {
          if (editor.read.view.isReadOnly()) return;
          const focusEditor =
            providedEditor ??
            editor.read((state) => {
              const selectionRoot = selectSelectionRoot(state);
              const innerHistoryRoot =
                fixedRoot ??
                selectionRoot ??
                (root !== MAIN_ROOT_KEY
                  ? root
                  : selectLastCommitSingleChangedRoot(state));

              return resolveHistoryFocusEditor({
                currentRoot: toInternalRoot(state.view.root()),
                editor,
                fallbackRoot: root,
                getActiveContentRootOwner,
                getContentRootOwnerViewEditor,
                getMountedViewEditor,
                historyRoot: innerHistoryRoot,
                selectionRoot: fixedRoot ? null : selectionRoot,
              });
            });

          if (!focusEditor.read((state) => state.selection())) {
            const point =
              focusEditor.read.points.start([]) ??
              failInvariant('Expected a document start point after history');
            focusEditor.update.selection.set({ anchor: point, focus: point });
          }

          const cancel = focusPliteEditableAfterEventFrame(focusEditor);
          pendingRestore.current = cancel;
          PENDING_HISTORY_FOCUS_RESTORES.set(runtimeOwner, cancel);
        };

        if (!domPhaseScheduler) {
          restoreFocus();

          return;
        }

        const cancelRestore = domPhaseScheduler.schedule(
          'model',
          'history-restore-root-focus',
          restoreFocus,
          { key: 'history-restore-root-focus', timing: 'animation-frame' }
        );

        PENDING_HISTORY_FOCUS_RESTORES.set(runtimeOwner, cancelRestore);
        pendingRestore.current = cancelRestore;
      }
    },
    [
      availability.canRedo,
      availability.canUndo,
      editor,
      fixedRoot,
      focusPolicy,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      providedEditor,
      root,
    ]
  );

  const undo = useCallback(() => {
    applyHistory('undo');
  }, [applyHistory]);

  const redo = useCallback(() => {
    applyHistory('redo');
  }, [applyHistory]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const direction = getHistoryDirectionFromNativeEvent(event.nativeEvent);

      if (!direction) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      applyHistory(direction);
    },
    [applyHistory]
  );

  return useMemo(
    () => ({
      canRedo: !readOnly && availability.canRedo,
      canUndo: !readOnly && availability.canUndo,
      onKeyDown,
      redo,
      root: publicRoot,
      undo,
    }),
    [
      availability.canRedo,
      availability.canUndo,
      onKeyDown,
      publicRoot,
      readOnly,
      redo,
      undo,
    ]
  );
}
