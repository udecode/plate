import React from 'react';

import {
  type AnyEditor,
  commitMatchesSelectorDependencies,
  countCoreWork,
  type EditorCommit,
  type EditorSelectorDependencies,
  type EditorViewStateBucket,
  type EditorViewStateFacts,
  type NormalizedSelectorDependencies,
  normalizeSelectorDependencies,
  readEditorViewStateFacts,
  sameResult,
  sameSelectorDependencies,
  selectorDependenciesViewSubscription,
  selectorDependenciesWantCommits,
  selectorDependenciesWantShownPreview,
  subscribeSharedEditorViewState,
  viewStateFactsChanged,
} from '../../../facade';
import type { Editor } from '../../editor';
import { usePlateScope } from '../../internal/plate-context';

/** Subscription options for `useEditorSelector`. */
export type UseEditorSelectorOptions<T = unknown> = {
  dependsOn?: EditorSelectorDependencies;
  equalityFn?: (prev: T, next: T) => boolean;
};

const useIsomorphicLayoutEffect =
  typeof document === 'undefined' ? React.useEffect : React.useLayoutEffect;

type EqualityFn<T> = NonNullable<UseEditorSelectorOptions<T>['equalityFn']>;

type Selected<T> = {
  deps: NormalizedSelectorDependencies;
  editor: AnyEditor;
  equalityFn: EqualityFn<T>;
  facts: EditorViewStateFacts;
  revision: number;
  selector: (editor: AnyEditor) => T;
  value: T;
  version: number | undefined;
};

const matchesSelected = <T>(
  entry: Selected<T>,
  editor: AnyEditor,
  selector: (editor: AnyEditor) => T,
  equalityFn: EqualityFn<T>,
  facts: EditorViewStateFacts,
  deps: NormalizedSelectorDependencies,
  revision: number
): boolean =>
  entry.editor === editor &&
  entry.selector === selector &&
  entry.equalityFn === equalityFn &&
  entry.revision === revision &&
  sameSelectorDependencies(entry.deps, deps) &&
  !viewStateFactsChanged(entry.facts, facts, deps);

const createSelection = <T>(initialDeps: NormalizedSelectorDependencies) => {
  let committed: Selected<T> | undefined;
  let tentative: Selected<T> | undefined;
  let committedDeps = initialDeps;
  let revision = 0;
  let seenDeps = initialDeps;
  let seenEditor: AnyEditor | undefined;
  let seenFacts: EditorViewStateFacts | undefined;
  let seenVersion: number | undefined;
  let notify: (() => void) | undefined;

  return {
    bindListener: (listener: (() => void) | undefined) => {
      notify = listener;
    },
    commit: (
      editor: AnyEditor | undefined,
      selector: (editor: AnyEditor) => T,
      equalityFn: EqualityFn<T>,
      value: T,
      renderedRevision: number,
      nextDeps: NormalizedSelectorDependencies
    ) => {
      const depsChanged = !sameSelectorDependencies(committedDeps, nextDeps);

      if (depsChanged) {
        committedDeps = nextDeps;
      }

      let changed = false;

      if (editor) {
        const facts = readEditorViewStateFacts(editor, committedDeps);
        const version = editor.read.lastCommit()?.version;
        const fromTentative =
          tentative &&
          tentative.revision === renderedRevision &&
          tentative.selector === selector &&
          tentative.equalityFn === equalityFn &&
          sameSelectorDependencies(tentative.deps, committedDeps)
            ? tentative
            : null;
        tentative = undefined;
        const rendered =
          fromTentative ??
          (committed &&
          committed.revision === renderedRevision &&
          committed.selector === selector &&
          committed.equalityFn === equalityFn &&
          sameSelectorDependencies(committed.deps, committedDeps)
            ? committed
            : null);
        committed = {
          deps: committedDeps,
          editor: rendered ? rendered.editor : editor,
          equalityFn,
          facts: rendered ? rendered.facts : facts,
          revision: renderedRevision,
          selector,
          value,
          version: rendered ? rendered.version : version,
        };
        if (renderedRevision === revision) {
          if (fromTentative) {
            seenDeps = fromTentative.deps;
            seenEditor = fromTentative.editor;
            seenFacts = fromTentative.facts;
            seenVersion = fromTentative.version;
          }
          const wantsCommits = selectorDependenciesWantCommits(committedDeps);
          if (
            editor !== seenEditor ||
            !sameSelectorDependencies(seenDeps, committedDeps) ||
            (wantsCommits && version !== seenVersion) ||
            !seenFacts ||
            viewStateFactsChanged(seenFacts, facts, committedDeps)
          ) {
            seenDeps = committedDeps;
            seenEditor = editor;
            seenFacts = facts;
            seenVersion = version;
            changed = true;
          }
        }
      }
      if (changed) {
        revision += 1;
        notify?.();
      }
    },
    factsChanged: (editor: AnyEditor) => {
      const nextFacts = readEditorViewStateFacts(editor, committedDeps);
      if (
        seenEditor === editor &&
        sameSelectorDependencies(seenDeps, committedDeps) &&
        seenFacts &&
        !viewStateFactsChanged(seenFacts, nextFacts, committedDeps)
      ) {
        return false;
      }
      seenDeps = committedDeps;
      seenEditor = editor;
      seenFacts = nextFacts;
      return true;
    },
    getDeps: () => committedDeps,
    getRevision: () => revision,
    invalidate: () => {
      revision += 1;
    },
    read: (
      editor: AnyEditor | undefined,
      selector: (editor: AnyEditor) => T,
      equalityFn: EqualityFn<T>,
      activeDeps: NormalizedSelectorDependencies
    ) => {
      if (!editor) {
        throw new Error('useEditor() requires an active Plate editor.');
      }
      const facts = readEditorViewStateFacts(editor, activeDeps);
      const version = editor.read.lastCommit()?.version;
      if (seenEditor === undefined) {
        seenDeps = activeDeps;
        seenEditor = editor;
        seenFacts = facts;
        seenVersion = version;
      }
      if (
        committed &&
        matchesSelected(
          committed,
          editor,
          selector,
          equalityFn,
          facts,
          activeDeps,
          revision
        )
      ) {
        return committed.value;
      }
      if (
        tentative &&
        tentative.version === version &&
        matchesSelected(
          tentative,
          editor,
          selector,
          equalityFn,
          facts,
          activeDeps,
          revision
        )
      ) {
        return tentative.value;
      }
      if (committed) {
        countCoreWork('selectorVisits');
      }
      const raw = editor.read(() => selector(editor));
      const value =
        committed && equalityFn(committed.value, raw) ? committed.value : raw;
      tentative = {
        deps: activeDeps,
        editor,
        equalityFn,
        facts,
        revision,
        selector,
        value,
        version,
      };
      return value;
    },
    recordVersion: (version: number) => {
      seenVersion = version;
    },
    syncEditorVersion: (
      editor: AnyEditor | undefined,
      activeDeps: NormalizedSelectorDependencies
    ) => {
      const version = editor?.read.lastCommit()?.version;
      const facts = editor
        ? readEditorViewStateFacts(editor, activeDeps)
        : undefined;
      const wantsCommits = selectorDependenciesWantCommits(activeDeps);
      if (
        editor !== seenEditor ||
        (wantsCommits && version !== seenVersion) ||
        (facts &&
          (!seenFacts || viewStateFactsChanged(seenFacts, facts, activeDeps)))
      ) {
        seenEditor = editor;
        seenFacts = facts;
        seenVersion = version;
        revision += 1;
        return true;
      }
      return false;
    },
    wants: (editor: AnyEditor, change: EditorCommit | undefined) =>
      commitMatchesSelectorDependencies(editor, change, committedDeps),
  };
};

/**
 * Subscribe to a value derived from the active Plate editor or an explicit
 * editor instance. Scope updates with `dependsOn` using commit kinds, state
 * fields, node keys, or view-state tokens (`'authored'`, `'composing'`,
 * `'focused'`, `'readOnly'`, `'view'`). Omitting `dependsOn` subscribes to
 * commits and all view-state changes (including focus and composition). A
 * change that leaves the value equal renders nothing.
 */
export function useEditorSelector<T>(
  selector: (editor: Editor) => T,
  options?: UseEditorSelectorOptions<T>
): T;
export function useEditorSelector<T, TEditor extends AnyEditor = AnyEditor>(
  editor: TEditor,
  selector: (editor: TEditor) => T,
  options?: UseEditorSelectorOptions<T>
): T;
export function useEditorSelector<T>(
  arg0: AnyEditor | ((editor: Editor) => T),
  arg1?: ((editor: AnyEditor) => T) | UseEditorSelectorOptions<T>,
  arg2?: UseEditorSelectorOptions<T>
): T {
  const hasExplicitEditor = typeof arg0 !== 'function';
  const explicitEditor = hasExplicitEditor ? arg0 : undefined;
  const selector = (hasExplicitEditor ? arg1 : arg0) as (
    editor: AnyEditor
  ) => T;
  const { dependsOn, equalityFn = sameResult } = ((hasExplicitEditor
    ? arg2
    : arg1) ?? {}) as UseEditorSelectorOptions<T>;
  const normalizedDeps = normalizeSelectorDependencies(dependsOn);
  const wantsCommits = selectorDependenciesWantCommits(normalizedDeps);
  const wantsShownPreview =
    selectorDependenciesWantShownPreview(normalizedDeps);
  const { allViewKinds, viewKinds } = normalizedDeps;
  const watchAuthored = allViewKinds || viewKinds.includes('authored');
  const watchComposing = allViewKinds || viewKinds.includes('composing');
  const watchFocused = allViewKinds || viewKinds.includes('focused');
  const watchReadOnly = allViewKinds || viewKinds.includes('readOnly');
  const scope = usePlateScope();
  const [selection] = React.useState(() => createSelection<T>(normalizedDeps));

  const read = (editor: AnyEditor | undefined) =>
    selection.read(editor, selector, equalityFn, normalizedDeps);

  const value = React.useSyncExternalStore(
    React.useCallback(
      (listener: () => void) => {
        selection.bindListener(listener);
        let editor: AnyEditor | undefined;
        let stopCommits: (() => void) | undefined;
        let stopView: (() => void) | undefined;
        const activeViewKinds: EditorViewStateBucket[] = [];

        if (!allViewKinds) {
          if (watchAuthored) activeViewKinds.push('authored');
          if (watchComposing) activeViewKinds.push('composing');
          if (watchFocused) activeViewKinds.push('focused');
          if (watchReadOnly) activeViewKinds.push('readOnly');
        }
        const activeSyncDeps: NormalizedSelectorDependencies = {
          all: wantsShownPreview && allViewKinds,
          allCommits: wantsShownPreview,
          allViewKinds,
          changeKinds: wantsCommits && !wantsShownPreview ? ['state'] : [],
          nodeEntries: [],
          stateFieldKeys: [],
          viewKinds: activeViewKinds,
        };
        const activeViewSub =
          selectorDependenciesViewSubscription(activeSyncDeps);
        const resolve = () =>
          hasExplicitEditor ? explicitEditor : scope.getSnapshot()?.editor;
        const follow = () => {
          const next = resolve();
          const changed = selection.syncEditorVersion(next, activeSyncDeps);
          if (next === editor) return changed;
          stopCommits?.();
          stopView?.();
          stopCommits = undefined;
          stopView = undefined;
          editor = next;
          if (!next) return true;
          if (wantsCommits) {
            stopCommits = next.subscribeCommit((change) => {
              if (!hasExplicitEditor && resolve() !== next) {
                if (follow()) listener();
                return;
              }
              selection.recordVersion(change.version);
              if (selection.wants(next, change)) {
                selection.invalidate();
                listener();
              }
            });
          }
          if (activeViewSub !== null) {
            stopView = subscribeSharedEditorViewState(
              next,
              activeViewSub,
              () => {
                if (!hasExplicitEditor && resolve() !== next) {
                  if (follow()) listener();
                  return;
                }
                if (selection.factsChanged(next)) {
                  selection.invalidate();
                  listener();
                }
              }
            );
          }
          return true;
        };
        follow();
        const stopScope = hasExplicitEditor
          ? undefined
          : scope.subscribe(() => {
              if (follow()) listener();
            });
        return () => {
          selection.bindListener(undefined);
          stopScope?.();
          stopCommits?.();
          stopView?.();
        };
      },
      [
        allViewKinds,
        explicitEditor,
        hasExplicitEditor,
        scope,
        selection,
        wantsCommits,
        wantsShownPreview,
        watchAuthored,
        watchComposing,
        watchFocused,
        watchReadOnly,
      ]
    ),
    () =>
      read(hasExplicitEditor ? explicitEditor : scope.getSnapshot()?.editor),
    () =>
      read(
        hasExplicitEditor ? explicitEditor : scope.getServerSnapshot()?.editor
      )
  );
  const renderedRevision = selection.getRevision();

  useIsomorphicLayoutEffect(() => {
    selection.commit(
      hasExplicitEditor ? explicitEditor : scope.getSnapshot()?.editor,
      selector,
      equalityFn,
      value,
      renderedRevision,
      normalizedDeps
    );
  });

  return value;
}
