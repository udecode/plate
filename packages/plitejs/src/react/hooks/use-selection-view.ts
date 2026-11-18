import { useCallback, useSyncExternalStore } from 'react';

import {
  resolveSelectionView,
  subscribeSelectionView,
} from '../../dom/internal';
import type { AnyEditor } from '../editable/runtime-editor-api';

/**
 * Return the mounted view whose root holds the selection when its Editable
 * sits inside the Editable of `editor`, or `editor` itself when none does.
 * When several views show that root, the focused one wins, then the
 * document's last focused view if it is one of them, else `editor`. A toolbar
 * outside a nested Editable acts on that Editable's view this way. The
 * document editor has no Editable, so it gets itself back.
 */
export const useSelectionView = <TEditor extends AnyEditor>(
  editor: TEditor
): TEditor =>
  useSyncExternalStore(
    useCallback(
      (listener) => subscribeSelectionView(editor, listener),
      [editor]
    ),
    () => resolveSelectionView(editor) ?? editor,
    () => editor
  );
