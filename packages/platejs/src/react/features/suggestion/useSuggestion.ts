import * as React from 'react';

import { DefaultAuthoredPlugin, type AuthoredChange } from '../../../authored';
import { RangeApi, TextApi, type EditorCommit, type Path } from '../../../core';
import { useEditorViewState } from '../../plite-react';
import { useEditor, useEditorSelector } from '../../stores';
import { useSuggestionViewStore } from './suggestion-view.internal';
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
      change.status === right[index].status &&
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

/** Read pending or conflicted authored changes intersecting one node path. */
export const useSuggestionChanges = (path: Path) => {
  const editor = useEditor();
  const authoredView = useEditorViewState(
    editor,
    () => editor.plugin(DefaultAuthoredPlugin).read.view(),
    {
      equalityFn: (left, right) =>
        left?.intent === right.intent && left.projection === right.projection,
    }
  );

  return useEditorSelector(
    (current) => {
      void authoredView;
      const entries = [
        ...current.read.nodes.entries({ at: path, match: TextApi.isText }),
      ];
      const first = entries[0];
      const last = entries.at(-1);
      if (!first || !last) return [];
      const root = current.read.view.root();
      return current.plugin(DefaultAuthoredPlugin).read.changesAt({
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
      });
    },
    { equalityFn: sameChanges, shouldUpdate: authoredChanged }
  );
};

/** Read whether the exact mounted editor view is editing or suggesting. */
export const useSuggestionMode = () => {
  const editor = useEditor();

  return useEditorViewState(editor, () =>
    editor.plugin(SuggestionPlugin).read.mode()
  );
};
