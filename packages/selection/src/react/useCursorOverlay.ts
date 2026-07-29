import { useEffect, useSyncExternalStore } from 'react';

import { useEditorPlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';
import type { CursorOverlayConfig } from './CursorOverlayPlugin';

export const useCursorOverlayPlugin = () => {
  const blockSelection = useEditorPlugin<BlockSelectionConfig>({
    key: KEYS.blockSelection,
  });
  const cursorOverlay = useEditorPlugin<CursorOverlayConfig>({
    key: KEYS.cursorOverlay,
  });
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
    if (!isSelecting) return;

    setTimeout(() => {
      cursorOverlay.api.removeCursor('selection');
    }, 0);
  }, [cursorOverlay.api, isSelecting]);
};
