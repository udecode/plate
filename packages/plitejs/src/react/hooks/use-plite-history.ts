import { type KeyboardEvent, useCallback, useMemo } from 'react';

import {
  type EditorStateView,
  type NamedRootKey,
  type RootKey,
  SelectionApi,
} from '../..';
import {
  type EditableHistoryReplayResult,
  type EditorHistoryFocusPolicy as EditableEditorHistoryFocusPolicy,
  getMountedEditableDOMRuntime,
} from '../editable/editable-dom-runtime';
import {
  getHistoryDirectionFromNativeEvent,
  type HistoryDirection,
} from '../editable/history-keyboard';
import { failInvariant, toInternalRoot } from '../editable/runtime-editor-api';
import type { Editor } from '../plugin/with-react';
import { MAIN_ROOT_KEY, toPublicRootOption } from '../root-key';
import { useEditorRuntimeState } from './use-editor-runtime-state';
import { useEditorViewState } from './use-editor-view-state';
import {
  createPliteRootEditor,
  useOptionalPliteRuntimeContext,
} from './use-plite-runtime';

/** Focus behavior after mounted undo or redo applies a history batch. */
export type EditorHistoryFocusPolicy = EditableEditorHistoryFocusPolicy;
export type EditorHistoryResult = Promise<EditableHistoryReplayResult>;

/** Options for history commands and shortcut handling. */
export type UseEditorHistoryOptions<TRoot extends RootKey = RootKey> = {
  focusPolicy?: EditorHistoryFocusPolicy;
} & (
  | {
      /** Bind commands and focus to this existing view, including outside an editor root. */
      editor: Editor<any, any>;
      root?: never;
    }
  | {
      editor?: undefined;
      root?: NamedRootKey<TRoot>;
    }
);

/** Undo/redo state and command handlers for one editor root. */
export type EditorHistoryController = {
  canRedo: boolean;
  canUndo: boolean;
  onKeyDown: (event: KeyboardEvent) => void;
  redo: () => EditorHistoryResult;
  root: RootKey | undefined;
  undo: () => EditorHistoryResult;
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

const selectSelectionRoot = (
  state: EditorStateView<any, any>
): RootKey | null => {
  const selection = state.selection();

  return selection ? (SelectionApi.root(selection) ?? MAIN_ROOT_KEY) : null;
};

const createHistoryRootSelector = (initialRoot: RootKey) => {
  let lastRoot = initialRoot;

  return (state: EditorStateView<any, any>): RootKey => {
    const selectionRoot = selectSelectionRoot(state);

    if (selectionRoot) lastRoot = selectionRoot;

    return selectionRoot ?? lastRoot;
  };
};

const selectHistoryAvailability = (state: unknown): HistoryAvailability => {
  const { history } = state as {
    history?: {
      hasRedo?: () => boolean;
      hasUndo?: () => boolean;
    };
  };

  return {
    canRedo: history?.hasRedo?.() ?? false,
    canUndo: history?.hasUndo?.() ?? false,
  };
};

/** Create undo/redo commands and keyboard handling for the active or fixed root. */
export function useEditorHistory<const TRoot extends RootKey = RootKey>({
  editor: providedEditor,
  focusPolicy = 'restore-root',
  root: fixedRoot,
}: UseEditorHistoryOptions<TRoot> = {}): EditorHistoryController {
  if (fixedRoot === MAIN_ROOT_KEY) {
    throw new Error(
      '[Plite] Omit root to bind history to the primary document.'
    );
  }

  const context = useOptionalPliteRuntimeContext();
  const source =
    providedEditor ??
    context?.runtime ??
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
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());
  const composing = useEditorViewState(editor, (view) => view.isComposing());
  const availability = useEditorRuntimeState(
    source,
    selectHistoryAvailability,
    { equalityFn: historyAvailabilityEquality }
  );

  const applyHistory = useCallback(
    (direction: HistoryDirection): EditorHistoryResult => {
      const runtime = getMountedEditableDOMRuntime(editor);

      return runtime
        ? runtime.replayHistory(direction, focusPolicy)
        : Promise.resolve({ reason: 'unmounted', status: 'unavailable' });
    },
    [editor, focusPolicy]
  );
  const undo = useCallback(() => applyHistory('undo'), [applyHistory]);
  const redo = useCallback(() => applyHistory('redo'), [applyHistory]);
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const direction = getHistoryDirectionFromNativeEvent(event.nativeEvent);

      if (!direction) return;

      if (
        readOnly ||
        composing ||
        (direction === 'undo' ? !availability.canUndo : !availability.canRedo)
      ) {
        return;
      }
      void applyHistory(direction);
      event.preventDefault();
      event.stopPropagation();
    },
    [
      applyHistory,
      availability.canRedo,
      availability.canUndo,
      composing,
      readOnly,
    ]
  );

  return useMemo(
    () => ({
      canRedo: !readOnly && !composing && availability.canRedo,
      canUndo: !readOnly && !composing && availability.canUndo,
      onKeyDown,
      redo,
      root: publicRoot,
      undo,
    }),
    [
      availability.canRedo,
      availability.canUndo,
      composing,
      onKeyDown,
      publicRoot,
      readOnly,
      redo,
      undo,
    ]
  );
}
