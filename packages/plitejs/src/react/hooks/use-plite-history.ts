import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import type { NamedRootKey, RootKey } from '../..';
import { readEditorHistoryHeadRoots } from '../../core/public-state';
import { subscribeRootViewPresentation } from '../../core/root-target';
import type { ViewPresentation } from '../../core/view-presentation';
import type { EditorHistoryFocusPolicy as EditableEditorHistoryFocusPolicy } from '../editable/editable-dom-runtime';
import {
  getHistoryDirectionFromNativeEvent,
  type HistoryDirection,
} from '../editable/history-keyboard';
import {
  applyModelOwnedHistoryIntent,
  type HistoryGateAnswer,
  readHistoryGate,
} from '../editable/mutation-history';
import { failInvariant } from '../editable/runtime-editor-api';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { Editor } from '../plugin/with-react';
import { MAIN_ROOT_KEY } from '../root-key';
import { useEditorRuntimeState } from './use-editor-runtime-state';
import { useEditorViewState } from './use-editor-view-state';
import { useGenericSelector } from './use-generic-selector';
import { useOptionalPliteRuntimeContext } from './use-plite-runtime';

/** Focus behavior after mounted undo or redo applies a history batch. */
export type EditorHistoryFocusPolicy = EditableEditorHistoryFocusPolicy;

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

/** Undo/redo availability and command handlers for the document's history. */
export type EditorHistoryController = {
  canRedo: boolean;
  canUndo: boolean;
  onKeyDown: (event: KeyboardEvent) => void;
  pending: HistoryDirection | null;
  redo: () => void;
  undo: () => void;
};

type HistoryAnswer = HistoryGateAnswer | Readonly<{ status: 'unchecked' }>;

type HistoryGates = Readonly<{
  presentation: ViewPresentation | null;
  redo: HistoryAnswer;
  undo: HistoryAnswer;
}>;

const EMPTY: HistoryAnswer = Object.freeze({ status: 'empty' });

const UNCHECKED: HistoryAnswer = Object.freeze({ status: 'unchecked' });

const readUncheckedAnswer = (editor: Editor, direction: HistoryDirection) =>
  readEditorHistoryHeadRoots(editor, direction) === null ? EMPTY : UNCHECKED;

const isReady = (answer: HistoryAnswer | undefined) =>
  answer?.status === 'open' || answer?.status === 'unchecked';

const openView = (answer: HistoryAnswer | undefined) =>
  answer?.status === 'open' ? (answer.view as ReactRuntimeEditor) : undefined;

const sameGateAnswer = (a: HistoryAnswer, b: HistoryAnswer) =>
  a === b || (a.status === b.status && openView(a) === openView(b));

const historyGatesEquality = (a: HistoryGates | null, b: HistoryGates | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.presentation === b.presentation &&
    sameGateAnswer(a.redo, b.redo) &&
    sameGateAnswer(a.undo, b.undo));

const selectHistoryPending = (state: unknown): HistoryDirection | null =>
  (
    state as { history?: { pending?: () => HistoryDirection | null } }
  ).history?.pending?.() ?? null;

/**
 * Create undo/redo commands and keyboard handling.
 *
 * Without `editor` or `root`, they run through the shown writable view used
 * last, and are on only while a shown writable `Editable` reaches every root
 * the next undo or redo changes. With `editor` or `root`, they replay the next
 * batch whatever roots it changes. With `root`, they are off while no view of
 * it is shown. With `editor`, they can stay on while no `Editable` runs that
 * editor, and a click then does nothing. They are off while their view is
 * read-only or composes text.
 */
export function useEditorHistory<const TRoot extends RootKey = RootKey>({
  editor: providedEditor,
  focusPolicy = 'restore-root',
  root: fixedRoot,
}: UseEditorHistoryOptions<TRoot> = {}): EditorHistoryController {
  if (fixedRoot === MAIN_ROOT_KEY) {
    throw new Error('Omit root to bind history to the primary document.');
  }

  const context = useOptionalPliteRuntimeContext();
  const source =
    providedEditor ??
    context?.runtime ??
    failInvariant('useEditorHistory requires an editor or an EditorRoot.');
  const follows = !providedEditor && !fixedRoot;
  const targetContext = fixedRoot ? context : null;
  const subscribeTarget = useCallback(
    (listener: () => void) =>
      targetContext && fixedRoot
        ? targetContext.subscribeRootTarget(fixedRoot, listener)
        : () => {},
    [fixedRoot, targetContext]
  );
  const readTarget = useCallback(
    () =>
      targetContext && fixedRoot
        ? targetContext.getRootTarget(fixedRoot)
        : null,
    [fixedRoot, targetContext]
  );
  const target = useSyncExternalStore(subscribeTarget, readTarget, readTarget);
  const fixedView = providedEditor ?? target?.view;
  const contextScope = context?.historyScope;
  const readGates = useCallback((): HistoryGates | null => {
    if (!follows) {
      return {
        presentation: null,
        redo: readUncheckedAnswer(source, 'redo'),
        undo: readUncheckedAnswer(source, 'undo'),
      };
    }

    return contextScope
      ? {
          presentation: contextScope.presentation,
          redo: readHistoryGate(contextScope, 'redo'),
          undo: readHistoryGate(contextScope, 'undo'),
        }
      : null;
  }, [contextScope, follows, source]);
  const [gates, updateGates] = useGenericSelector(
    readGates,
    historyGatesEquality
  );
  const presentation = gates?.presentation;

  useEffect(() => {
    const stopCommits = source.subscribeCommit(() => updateGates());
    const stopNotice = presentation
      ? subscribeRootViewPresentation(presentation, updateGates)
      : undefined;

    updateGates();

    return () => {
      stopCommits();
      stopNotice?.();
    };
  }, [presentation, source, updateGates]);

  const historyEditor = follows
    ? (openView(gates?.undo) ?? openView(gates?.redo))
    : fixedView;
  const shown = providedEditor || follows ? true : (target?.shown ?? false);
  const readOnly = useEditorViewState(historyEditor ?? source, (view) =>
    view.isReadOnly()
  );
  const composing = useEditorViewState(historyEditor ?? source, (view) =>
    view.isComposing()
  );
  const pending = useEditorRuntimeState(source, selectHistoryPending);
  const undoReady = isReady(gates?.undo);
  const redoReady = isReady(gates?.redo);

  const applyHistory = useCallback(
    (direction: HistoryDirection) => {
      const editor = follows
        ? contextScope && openView(readHistoryGate(contextScope, direction))
        : (providedEditor ??
          (targetContext && fixedRoot
            ? targetContext.getRootTarget(fixedRoot)?.view
            : undefined));

      return editor
        ? applyModelOwnedHistoryIntent({
            direction,
            editor,
            focusPolicy,
            rootCheck: follows ? 'check' : 'skip',
          })
        : false;
    },
    [
      contextScope,
      fixedRoot,
      focusPolicy,
      follows,
      providedEditor,
      targetContext,
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

      if (!direction || readOnly || composing) return;
      if (!pending && (direction === 'undo' ? !undoReady : !redoReady)) {
        return;
      }
      if (!applyHistory(direction)) return;

      event.preventDefault();
      event.stopPropagation();
    },
    [applyHistory, composing, pending, readOnly, redoReady, undoReady]
  );

  return useMemo(
    () => ({
      canRedo:
        shown && !readOnly && !composing && pending === null && redoReady,
      canUndo:
        shown && !readOnly && !composing && pending === null && undoReady,
      onKeyDown,
      pending,
      redo,
      undo,
    }),
    [
      composing,
      onKeyDown,
      pending,
      readOnly,
      redo,
      redoReady,
      shown,
      undo,
      undoReady,
    ]
  );
}
