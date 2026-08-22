import { useEditorPlugin } from '@platejs/core/react';
import { useEffect, useSyncExternalStore } from 'react';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';
import { CursorOverlayPlugin } from './CursorOverlayPlugin';

export const useCursorOverlayPlugin = () => {
  const blockSelection = useEditorPlugin(BlockSelectionPlugin);
  const cursorOverlay = useEditorPlugin(CursorOverlayPlugin);
  const isSelecting = useSyncExternalStore(
    (listener) =>
      blockSelection.installed
        ? blockSelection.store.subscribe(listener)
        : () => {},
    () =>
      blockSelection.installed
        ? blockSelection.store.get('isSelecting')
        : false,
    () => false
  );

  useEffect(() => {
    if (!isSelecting) return undefined;

    const timeout = setTimeout(() => {
      cursorOverlay.api.removeCursor('selection');
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [cursorOverlay.api, isSelecting]);
};
