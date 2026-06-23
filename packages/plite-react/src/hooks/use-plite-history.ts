import { type KeyboardEvent, useCallback, useMemo } from 'react';
import type { EditorUpdateOptions, Operation, RootKey } from '@platejs/plite';
import { resolveHistoryFocusEditor } from '../editable/history-focus';
import {
  getHistoryDirectionFromNativeEvent,
  type HistoryDirection,
} from '../editable/history-keyboard';
import {
  getOperationRoot,
  MAIN_ROOT_KEY,
  toPublicRootOption,
} from '../root-key';
import {
  readPliteViewSelection,
  readPliteViewSelectionHistoryEntry,
  writePliteViewSelection,
} from '../view-selection';
import { schedulePliteReactFocus } from './focus-scheduler';
import { focusPliteEditableAfterEventFrame } from './focus-plite-editable';
import {
  useRequiredPliteRuntimeContext,
  usePliteRootEditor,
  usePliteRuntimeState,
} from './use-plite-runtime';

/** Focus behavior after undo or redo commands. */
export type PliteHistoryFocusPolicy = 'none' | 'preserve' | 'restore-root';

/** Options for history commands and shortcut handling. */
export type UsePliteHistoryOptions = {
  focusPolicy?: PliteHistoryFocusPolicy;
  root?: RootKey;
};

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

const historyAvailabilityEquality = (
  a: HistoryAvailability | null,
  b: HistoryAvailability
) => a?.canRedo === b.canRedo && a.canUndo === b.canUndo;

const nullableRootKeyEquality = (a: RootKey | null, b: RootKey | null) =>
  a === b;

const selectSelectionRoot = (state: unknown): RootKey | null => {
  const selection = (
    state as {
      selection?: {
        get?: () => {
          anchor: { root?: RootKey };
          focus: { root?: RootKey };
        } | null;
      };
    }
  ).selection?.get?.();

  if (!selection) {
    return null;
  }

  return (selection.anchor.root ??
    selection.focus.root ??
    MAIN_ROOT_KEY) as RootKey;
};

const selectLastCommitSingleOperationRoot = (
  state: unknown
): RootKey | null => {
  const commit = (
    state as {
      value?: {
        lastCommit?: () => { operations?: readonly Operation[] } | null;
      };
    }
  ).value?.lastCommit?.();
  const roots = new Set(
    (commit?.operations ?? [])
      .filter((operation) => operation.type !== 'set_selection')
      .map(getOperationRoot)
  );

  return roots.size === 1 ? (roots.values().next().value ?? null) : null;
};

const createHistoryRootSelector = () => {
  let lastRoot: RootKey = MAIN_ROOT_KEY;

  return (state: unknown): RootKey => {
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
  const history = (
    state as {
      history?: {
        redos?: () => readonly unknown[];
        undos?: () => readonly unknown[];
      };
    }
  ).history;
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

const getHistoryUpdateOptions = (
  focus: PliteHistoryFocusPolicy
): EditorUpdateOptions => ({
  ...(focus === 'preserve'
    ? {
        metadata: {
          selection: {
            dom: 'preserve',
            focus: false,
            scroll: false,
          },
        },
      }
    : null),
  skipNormalize: true,
});

/**
 * Create undo/redo commands and keyboard handling for the active or fixed root.
 *
 * The controller follows the current selection root by default, or a fixed
 * `root` when provided. Use `canUndo` / `canRedo` for disabled UI, wire
 * `onKeyDown` to editor chrome that owns shortcuts, and choose `focusPolicy`
 * based on whether undo/redo should restore editor focus.
 */
export function usePliteHistory({
  focusPolicy = 'restore-root',
  root: fixedRoot,
}: UsePliteHistoryOptions = {}): PliteHistoryController {
  if (fixedRoot === MAIN_ROOT_KEY) {
    throw new Error(
      '[Plite] Omit root to bind history to the primary document.'
    );
  }

  const historyRootSelector = useMemo(() => createHistoryRootSelector(), []);
  const historyRoot = usePliteRuntimeState(historyRootSelector, {
    deps: [historyRootSelector],
    equalityFn: nullableRootKeyEquality,
    shouldUpdate: (change) => Boolean(change?.selectionChanged),
  });
  const root = fixedRoot ?? historyRoot;
  const publicRoot = toPublicRootOption(root);
  const editor = usePliteRootEditor(publicRoot);
  const {
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
  } = useRequiredPliteRuntimeContext();
  const availability = usePliteRuntimeState(selectHistoryAvailability, {
    deps: [],
    equalityFn: historyAvailabilityEquality,
  });

  const applyHistory = useCallback(
    (direction: HistoryDirection) => {
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
      let applied = false;

      writePliteViewSelection(editor, viewSelectionAfterHistory ?? null);
      try {
        editor.update((tx) => {
          if (!hasHistoryCommands(tx)) {
            return;
          }

          tx.history[direction]();
          applied = true;
        }, getHistoryUpdateOptions(focusPolicy));
      } catch (error) {
        writePliteViewSelection(editor, previousViewSelection);
        throw error;
      }

      if (!applied) {
        writePliteViewSelection(editor, previousViewSelection);
        return;
      }

      if (focusPolicy === 'restore-root') {
        schedulePliteReactFocus(() => {
          const focusEditor = editor.read((state) =>
            resolveHistoryFocusEditor({
              currentRoot: state.view.root(),
              editor,
              fallbackRoot: root,
              getActiveContentRootOwner,
              getContentRootOwnerViewEditor,
              getMountedViewEditor,
              historyRoot: selectLastCommitSingleOperationRoot(state),
              selectionRoot: selectSelectionRoot(state),
            })
          );

          if (!focusEditor.read((state) => state.selection.get())) {
            focusEditor.update((tx) => {
              const point = tx.points.start([]);
              tx.selection.set({ anchor: point, focus: point });
            });
          }

          focusPliteEditableAfterEventFrame(focusEditor);
        });
      }
    },
    [
      availability.canRedo,
      availability.canUndo,
      editor,
      focusPolicy,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
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
      canRedo: availability.canRedo,
      canUndo: availability.canUndo,
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
      redo,
      undo,
    ]
  );
}
