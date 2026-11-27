import React from 'react';

import {
  commitMatchesSelectorDependencies,
  type EditorCommit,
  type NormalizedSelectorDependencies,
  normalizeSelectorDependencies,
  readShownPreview,
  sameResult,
  sameSelectorDependencies,
} from '../../../facade';
import type { Editor } from '../../editor';
import {
  subscribeAuthoredViewState,
  usePlateScope,
} from '../../internal/plate-context';
import type { EditorRuntimeStateSelectorOptions } from '../../plite-react';

export type UseEditorSelectorOptions<T> = EditorRuntimeStateSelectorOptions<T>;

const useIsomorphicLayoutEffect =
  typeof document === 'undefined' ? React.useEffect : React.useLayoutEffect;

type EqualityFn<T> = NonNullable<UseEditorSelectorOptions<T>['equalityFn']>;

type Selected<T> = {
  editor: Editor;
  equalityFn: EqualityFn<T>;
  preview: ReturnType<typeof readShownPreview>;
  revision: number;
  selector: (editor: Editor) => T;
  value: T;
  version: number | undefined;
};

const matchesSelected = <T>(
  entry: Selected<T>,
  editor: Editor,
  selector: (editor: Editor) => T,
  equalityFn: EqualityFn<T>,
  preview: ReturnType<typeof readShownPreview>,
  revision: number
): boolean =>
  entry.editor === editor &&
  entry.selector === selector &&
  entry.equalityFn === equalityFn &&
  entry.preview === preview &&
  entry.revision === revision;

const createSelection = <T>(initialDeps: NormalizedSelectorDependencies) => {
  let committed: Selected<T> | undefined;
  let tentative: Selected<T> | undefined;
  let committedDeps = initialDeps;
  let revision = 0;
  let seenEditor: Editor | undefined;
  let seenPreview: ReturnType<typeof readShownPreview> | undefined;
  let seenVersion: number | undefined;
  let notify: (() => void) | undefined;

  return {
    bindListener: (listener: (() => void) | undefined) => {
      notify = listener;
    },
    commit: (
      editor: Editor | undefined,
      selector: (editor: Editor) => T,
      equalityFn: EqualityFn<T>,
      value: T,
      renderedRevision: number,
      nextDeps: NormalizedSelectorDependencies
    ) => {
      if (editor) {
        const preview = readShownPreview(editor);
        const version = editor.read.lastCommit()?.version;
        committed = {
          editor,
          equalityFn,
          preview,
          revision: renderedRevision,
          selector,
          value,
          version,
        };
        if (renderedRevision === revision) {
          seenEditor = editor;
          seenPreview = preview;
          seenVersion = version;
        }
      }
      if (!sameSelectorDependencies(committedDeps, nextDeps)) {
        committedDeps = nextDeps;
        revision += 1;
        notify?.();
      }
    },
    getRevision: () => revision,
    invalidate: () => {
      revision += 1;
    },
    previewChanged: (editor: Editor) => {
      const nextPreview = readShownPreview(editor);
      if (seenEditor === editor && seenPreview === nextPreview) return false;
      seenEditor = editor;
      seenPreview = nextPreview;
      return true;
    },
    read: (
      editor: Editor | undefined,
      selector: (editor: Editor) => T,
      equalityFn: EqualityFn<T>
    ) => {
      if (!editor) {
        throw new Error('useEditor() requires an active Plate editor.');
      }
      const preview = readShownPreview(editor);
      const version = editor.read.lastCommit()?.version;
      if (seenEditor === undefined) {
        seenEditor = editor;
        seenPreview = preview;
        seenVersion = version;
      }
      if (
        committed &&
        matchesSelected(
          committed,
          editor,
          selector,
          equalityFn,
          preview,
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
          preview,
          revision
        )
      ) {
        return tentative.value;
      }
      const raw = editor.read(() => selector(editor));
      const value =
        committed && equalityFn(committed.value, raw) ? committed.value : raw;
      tentative = {
        editor,
        equalityFn,
        preview,
        revision,
        selector,
        value,
        version,
      };
      return value;
    },
    syncEditorVersion: (editor: Editor | undefined) => {
      const version = editor?.read.lastCommit()?.version;
      const preview = editor ? readShownPreview(editor) : undefined;
      if (
        editor !== seenEditor ||
        version !== seenVersion ||
        preview !== seenPreview
      ) {
        seenEditor = editor;
        seenPreview = preview;
        seenVersion = version;
        revision += 1;
        return true;
      }
      return false;
    },
    recordVersion: (version: number) => {
      seenVersion = version;
    },
    wants: (editor: Editor, change: EditorCommit | undefined) =>
      commitMatchesSelectorDependencies(editor, change, committedDeps),
  };
};

/**
 * Subscribe to a value derived from the selected editor. A selector that
 * keeps its identity between renders runs at most once per matching commit,
 * once more when the selected editor changes, such as when the caret moves to
 * another root, and once more when the editor shows a different review preview
 * than the selector last read. A selector or `equalityFn` written inline gets
 * a new identity each render, so it also runs on every render of its
 * component. A change that leaves the value equal renders nothing.
 */
export const useEditorSelector = <T>(
  selector: (editor: Editor) => T,
  options: UseEditorSelectorOptions<T> = {}
): T => {
  const { dependsOn, equalityFn = sameResult } = options;
  const normalizedDeps = normalizeSelectorDependencies(dependsOn);
  const scope = usePlateScope();
  const [selection] = React.useState(() => createSelection<T>(normalizedDeps));

  const read = (editor: Editor | undefined) =>
    selection.read(editor, selector, equalityFn);

  const value = React.useSyncExternalStore(
    React.useCallback(
      (listener: () => void) => {
        selection.bindListener(listener);
        let editor: Editor | undefined;
        let stopCommits: (() => void) | undefined;
        let stopView: (() => void) | undefined;
        const follow = () => {
          const next = scope.getSnapshot()?.editor;
          const changed = selection.syncEditorVersion(next);
          if (next === editor) return changed;
          stopCommits?.();
          stopView?.();
          stopCommits = undefined;
          stopView = undefined;
          editor = next;
          if (!next) return true;
          stopCommits = next.subscribeCommit((change) => {
            selection.recordVersion(change.version);
            if (selection.wants(next, change)) {
              selection.invalidate();
              listener();
            }
          });
          stopView = subscribeAuthoredViewState(next, () => {
            if (selection.previewChanged(next)) {
              selection.invalidate();
              listener();
            }
          });
          return true;
        };
        follow();
        const stopScope = scope.subscribe(() => {
          if (follow()) listener();
        });
        return () => {
          selection.bindListener(undefined);
          stopScope();
          stopCommits?.();
          stopView?.();
        };
      },
      [scope, selection]
    ),
    () => read(scope.getSnapshot()?.editor),
    () => read(scope.getServerSnapshot()?.editor)
  );
  const renderedRevision = selection.getRevision();

  useIsomorphicLayoutEffect(() => {
    selection.commit(
      scope.getSnapshot()?.editor,
      selector,
      equalityFn,
      value,
      renderedRevision,
      normalizedDeps
    );
  });

  return value;
};
