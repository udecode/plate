import { useCallback, useSyncExternalStore } from 'react';

import {
  type DropIndicator,
  readDropIndicator,
  subscribeDropIndicator,
} from '../../dom/utils/drop-indicator';
import { useEditorContext } from './use-editor-context';

/**
 * This view's block drop indicator while a block drag hovers an admitted
 * edge: the target key, edge, axis and the viewport line to paint.
 */
export const useDropIndicator = (): DropIndicator | null => {
  const editor = useEditorContext();

  return useSyncExternalStore(
    useCallback(
      (listener) => subscribeDropIndicator(editor, listener),
      [editor]
    ),
    () => readDropIndicator(editor),
    () => null
  );
};
