import { useCallback, useSyncExternalStore } from 'react';

import {
  EMPTY_AUTHORED_FRAGMENT_SLOTS,
  readAuthoredViewFragmentSlots,
  subscribeAuthoredViewFragmentSlots,
} from '../../core/authored-runtime';
import type { NodeKey } from '../../interfaces/editor';
import { useEditorContext } from './use-editor-context';

export const useAuthoredFragmentSlots = (nodeKey?: NodeKey | null) => {
  const editor = useEditorContext();
  const read = useCallback(
    () =>
      nodeKey === null
        ? EMPTY_AUTHORED_FRAGMENT_SLOTS
        : readAuthoredViewFragmentSlots(editor, nodeKey),
    [editor, nodeKey]
  );
  return useSyncExternalStore(
    useCallback(
      (notify) =>
        nodeKey === null
          ? () => {}
          : subscribeAuthoredViewFragmentSlots(editor, nodeKey, notify),
      [editor, nodeKey]
    ),
    read,
    read
  );
};
