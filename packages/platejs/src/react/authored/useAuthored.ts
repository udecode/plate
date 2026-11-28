import * as React from 'react';

import {
  type AuthoredChangeGroup,
  type AuthoredChangesDelta,
  AuthoredPlugin,
} from '../../authored';
import type { NodeKey } from '../../core';
import { isDocumentView } from '../../facade';
import { useEditor, useViewStore } from '../stores';
import {
  AuthoredReactPlugin,
  setActiveAuthoredId,
} from './AuthoredReactPlugin';

const sameGroups = (
  left: readonly AuthoredChangeGroup[],
  right: readonly AuthoredChangeGroup[]
) =>
  left.length === right.length &&
  left.every(
    (group, index) =>
      group.id === right[index]?.id && group.revision === right[index]?.revision
  );

/** Read and update the active authored review card owned by the mounted editor view. */
export const useActiveAuthored = () => {
  const editor = useEditor();

  if (!editor.plugin(AuthoredReactPlugin).installed) {
    throw new Error('Authored hooks require a mounted AuthoredReactPlugin.');
  }

  const storedActiveId = useViewStore(
    AuthoredReactPlugin,
    (state) => state.activeId
  );
  const activeId = isDocumentView(editor) ? null : storedActiveId;
  const setActiveId = React.useCallback(
    (next: string | null) => {
      setActiveAuthoredId(editor, next);
    },
    [editor]
  );

  return React.useMemo(
    () => ({ activeId, setActiveId }),
    [activeId, setActiveId]
  );
};

/**
 * Read the review cards of the block with this key. A review delta that names
 * the block rereads them. A delta names top-level blocks only, so a nested
 * block's cards reread only when the component that calls this hook renders.
 */
export const useAuthoredGroups = (blockKey: NodeKey) => {
  const editor = useEditor();
  const last = React.useRef<{ value: readonly AuthoredChangeGroup[] } | null>(
    null
  );
  const subscribe = React.useCallback(
    (wake: () => void) =>
      editor
        .plugin(AuthoredPlugin)
        .api.subscribeChanges((delta: AuthoredChangesDelta) => {
          if (
            delta.blocks.includes(blockKey) ||
            last.current?.value.some((group) => delta.groups.includes(group.id))
          ) {
            wake();
          }
        }),
    [blockKey, editor]
  );
  const snapshot = () => {
    const next = editor.plugin(AuthoredPlugin).read.groups({ at: blockKey });

    if (!last.current || !sameGroups(last.current.value, next)) {
      last.current = { value: next };
    }

    return last.current.value;
  };

  return React.useSyncExternalStore(subscribe, snapshot, snapshot);
};
