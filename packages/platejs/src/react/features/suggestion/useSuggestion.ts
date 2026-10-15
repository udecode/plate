import * as React from 'react';

import {
  AuthoredPlugin,
  type AuthoredChange,
  type AuthoredChangeGroup,
  type AuthoredChangesDelta,
} from '../../../authored';
import {
  RangeApi,
  TextApi,
  type EditorCommit,
  type NodeKey,
  type Path,
} from '../../../core';
import { useEditorViewState } from '../../plite-react';
import { useEditor, useEditorSelector } from '../../stores';
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

/** Read pending authored changes intersecting one node path. */
export const useSuggestionChanges = (path: Path) => {
  const editor = useEditor();
  const view = useEditorViewState(editor, () =>
    viewKey(editor.plugin(AuthoredPlugin).read.view())
  );

  return useEditorSelector(
    (current) => {
      void view;
      const entries = [
        ...current.read.nodes.entries({ at: path, match: TextApi.isText }),
      ];
      const first = entries[0];
      const last = entries.at(-1);
      if (!first || !last) return [];
      const root = current.read.view.root();
      const at = {
        anchor: {
          offset: 0,
          path: first[1],
          ...(root ? { root } : {}),
        },
        focus: {
          offset: last[0].text.length,
          path: last[1],
          ...(root ? { root } : {}),
        },
      };
      const changes: AuthoredChange[] = [];

      for (let cursor: string | undefined; ;) {
        const page = current
          .plugin(AuthoredPlugin)
          .read.changes({ at, cursor, limit: 200 });

        changes.push(...page.items);
        if (!page.cursor) return changes;
        ({ cursor } = page);
      }
    },
    { equalityFn: sameChanges, shouldUpdate: authoredChanged }
  );
};

const NO_GROUPS: readonly AuthoredChangeGroup[] = Object.freeze([]);

const useAuthoredRead = <T>(
  read: () => T,
  {
    equal,
    when,
  }: {
    equal: (last: T, next: T) => boolean;
    when: (delta: AuthoredChangesDelta) => boolean;
  }
) => {
  const editor = useEditor();
  const last = React.useRef<{ value: T } | null>(null);
  const subscribe = React.useCallback(
    (wake: () => void) =>
      editor.plugin(AuthoredPlugin).api.subscribeChanges((delta) => {
        if (when(delta)) wake();
      }),
    [editor, when]
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

/** Read the review cards touching one top-level block. */
export const useSuggestionGroups = (blockKey: NodeKey) => {
  const editor = useEditor();
  const when = React.useCallback(
    (delta: AuthoredChangesDelta) => delta.blocks.includes(blockKey),
    [blockKey]
  );

  return useAuthoredRead(
    () => {
      const index = editor.read.nodes.path(blockKey)?.[0];

      return index === undefined
        ? NO_GROUPS
        : editor.plugin(AuthoredPlugin).read.groups({ at: [index] });
    },
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
