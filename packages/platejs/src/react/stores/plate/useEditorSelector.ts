import React from 'react';

import { runEditorObserver, sameResult } from '../../../facade';
import type { Editor } from '../../editor';
import { usePlateScope } from '../../internal/plate-context';
import type { EditorRuntimeStateSelectorOptions } from '../../plite-react';

export type UseEditorSelectorOptions<T> = EditorRuntimeStateSelectorOptions<
  T,
  Editor
>;

type Selected<T> = {
  editor: Editor;
  selector: (editor: Editor) => T;
  value: T;
  version: number | undefined;
};

type ShouldUpdate<T> = NonNullable<UseEditorSelectorOptions<T>['shouldUpdate']>;

const createSelection = <T>() => {
  let last: Selected<T> | undefined;
  let shouldUpdate: ShouldUpdate<T> | undefined;

  return {
    read: (
      editor: Editor | undefined,
      selector: (editor: Editor) => T,
      equalityFn: NonNullable<UseEditorSelectorOptions<T>['equalityFn']>,
      shouldUpdateNow: ShouldUpdate<T> | undefined
    ) => {
      if (!editor) {
        throw new Error('useEditor() requires an active Plate editor.');
      }
      shouldUpdate = shouldUpdateNow;
      const version = editor.read.lastCommit()?.version;
      if (
        last?.editor !== editor ||
        last.selector !== selector ||
        last.version !== version
      ) {
        const value = editor.read(() => selector(editor));
        last = {
          editor,
          selector,
          value: last && equalityFn(last.value, value) ? last.value : value,
          version,
        };
      }
      return last.value;
    },
    wants: (editor: Editor, change: Parameters<ShouldUpdate<T>>[0]) => {
      let wanted = true;
      runEditorObserver(editor, 'commit-listener', () => {
        wanted = shouldUpdate?.(change) ?? true;
      });
      return wanted;
    },
  };
};

/**
 * Subscribe to a value derived from the selected editor. A selector that
 * keeps its identity between renders runs at most once per commit, and once
 * more when the selected editor changes, such as when the caret moves to
 * another root. A selector written inline gets a new identity each render, so
 * it also runs on every render of its component. A change that leaves the
 * value equal renders nothing.
 */
export const useEditorSelector = <T>(
  selector: (editor: Editor) => T,
  options: UseEditorSelectorOptions<T> = {}
): T => {
  const { equalityFn = sameResult, shouldUpdate } = options;
  const scope = usePlateScope();
  const [selection] = React.useState(createSelection<T>);
  const read = (editor: Editor | undefined) =>
    selection.read(editor, selector, equalityFn, shouldUpdate);

  return React.useSyncExternalStore(
    React.useCallback(
      (listener: () => void) => {
        let editor: Editor | undefined;
        let stopCommits: (() => void) | undefined;
        const follow = () => {
          const next = scope.getSnapshot()?.editor;
          if (next === editor) return;
          stopCommits?.();
          editor = next;
          stopCommits = next?.subscribeCommit((change) => {
            if (selection.wants(next, change)) listener();
          });
        };
        follow();
        const stopScope = scope.subscribe(() => {
          follow();
          listener();
        });
        return () => {
          stopScope();
          stopCommits?.();
        };
      },
      [scope, selection]
    ),
    () => read(scope.getSnapshot()?.editor),
    () => read(scope.getServerSnapshot()?.editor)
  );
};
