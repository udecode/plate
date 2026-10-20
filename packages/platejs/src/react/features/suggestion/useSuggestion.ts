import * as React from 'react';

import {
  AuthoredPlugin,
  type AuthoredChange,
  type AuthoredChangeGroup,
  type AuthoredChangesDelta,
} from '../../../authored';
import {
  RangeApi,
  type EditorCommit,
  type NodeKey,
  type Path,
} from '../../../core';
import { useEditorViewState } from '../../plite-react';
import { useEditor } from '../../stores';
import { useSuggestionViewStore, viewKey } from './suggestion-view.internal';
import { SuggestionPlugin } from './SuggestionPlugin';

const sameChanges = (
  left: readonly AuthoredChange[] | null,
  right: readonly AuthoredChange[]
) =>
  left?.length === right.length &&
  left.every(
    (change, index) =>
      change.id === right[index]?.id &&
      change.revision === right[index].revision &&
      change.ranges.length === right[index].ranges.length &&
      change.ranges.every((range, rangeIndex) =>
        RangeApi.equals(range, right[index].ranges[rangeIndex] ?? null)
      )
  );

const authoredChanged = (commit?: EditorCommit) =>
  Boolean(
    commit?.changed.hasAny('document') || commit?.changed.hasAny('state')
  );

/** Read the active suggestion owned by the exact mounted editor view. */
export const useActiveSuggestion = () => {
  const store = useSuggestionViewStore();
  const { activeId } = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  return React.useMemo(
    () => ({ activeId, setActiveId: store.setActiveId }),
    [activeId, store]
  );
};

const sameGroups = (
  left: readonly AuthoredChangeGroup[],
  right: readonly AuthoredChangeGroup[]
) =>
  left.length === right.length &&
  left.every(
    (group, index) =>
      group.id === right[index]?.id && group.revision === right[index]?.revision
  );

const useAuthoredRead = <T>(
  read: () => T,
  {
    commit,
    equal,
    when,
  }: {
    commit?: (commit: EditorCommit) => boolean;
    equal: (last: T, next: T) => boolean;
    when: (delta: AuthoredChangesDelta) => boolean;
  }
) => {
  const editor = useEditor();
  const last = React.useRef<{ value: T } | null>(null);
  const subscribe = React.useCallback(
    (wake: () => void) => {
      const unsubscribeChanges = editor
        .plugin(AuthoredPlugin)
        .api.subscribeChanges((delta) => {
          if (when(delta)) wake();
        });
      const unsubscribeCommits = commit
        ? editor.subscribeCommit((next) => {
            if (commit(next)) wake();
          })
        : null;

      return () => {
        unsubscribeChanges();
        unsubscribeCommits?.();
      };
    },
    [commit, editor, when]
  );
  const snapshot = () => {
    const next = read();

    if (!last.current || !equal(last.current.value, next)) {
      last.current = { value: next };
    }

    return last.current.value;
  };

  return React.useSyncExternalStore(subscribe, snapshot, snapshot);
};

/**
 * Read the pending authored changes of the node at a path of the mounted view.
 * A commit that changes the document or its state rereads them, and so does a
 * review delta that names the path's top-level block, which covers a change a
 * preview hides.
 */
export const useSuggestionChanges = (path: Path) => {
  const editor = useEditor();
  const top = path[0];
  const when = React.useCallback(
    (delta: AuthoredChangesDelta) => {
      if (top === undefined) return delta.blocks.length > 0;

      // A review delta names top-level blocks only, so a nested place wakes
      // on the top-level block that holds it.
      const key = editor.key([top]);

      return key !== null && delta.blocks.includes(key);
    },
    [editor, top]
  );

  // A view switch changes what the path shows without a commit.
  useEditorViewState(editor, () =>
    viewKey(editor.plugin(AuthoredPlugin).read.view())
  );

  return useAuthoredRead(
    () => {
      const changes: AuthoredChange[] = [];

      for (let cursor: string | undefined; ;) {
        const page = editor
          .plugin(AuthoredPlugin)
          .read.changes({ at: path, cursor, limit: 200 });

        changes.push(...page.items);
        if (!page.cursor) return changes;
        ({ cursor } = page);
      }
    },
    { commit: authoredChanged, equal: sameChanges, when }
  );
};

/**
 * Read the review cards of the block with this key. A review delta that names
 * the block rereads them. A delta names top-level blocks only, so a nested
 * block's cards reread only when the component that calls this hook renders.
 */
export const useSuggestionGroups = (blockKey: NodeKey) => {
  const editor = useEditor();
  const when = React.useCallback(
    (delta: AuthoredChangesDelta) => delta.blocks.includes(blockKey),
    [blockKey]
  );

  return useAuthoredRead(
    () => editor.plugin(AuthoredPlugin).read.groups({ at: blockKey }),
    { equal: sameGroups, when }
  );
};

/** Read whether the exact mounted editor view is editing or suggesting. */
export const useSuggestionMode = () => {
  const editor = useEditor();

  return useEditorViewState(editor, () =>
    editor.plugin(SuggestionPlugin).read.mode()
  );
};
