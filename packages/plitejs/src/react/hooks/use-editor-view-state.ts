import { useCallback, useSyncExternalStore } from 'react';

import type { EditorStateView } from '../..';
import type { EditorViewStateBucket } from '../../core/selector-dependencies';
import {
  type AnyEditor,
  subscribeSharedEditorViewState,
} from '../editable/runtime-editor-api';

const NOOP_SUBSCRIBE = () => () => {};

export function useOptionalEditorViewState<T>(
  editor: AnyEditor | null,
  kind: EditorViewStateBucket,
  selector: (view: EditorStateView['view']) => T,
  nullFallback: T,
  readOnServer = false
): T {
  const subscribe = useCallback(
    (listener: () => void) =>
      editor
        ? subscribeSharedEditorViewState(editor, kind, listener)
        : () => {},
    [editor, kind]
  );
  const getSnapshot = useCallback(
    () =>
      editor ? editor.read((state) => selector(state.view)) : nullFallback,
    [editor, nullFallback, selector]
  );
  const getServerSnapshot = useCallback(
    () =>
      readOnServer && editor
        ? editor.read((state) => selector(state.view))
        : nullFallback,
    [editor, nullFallback, readOnServer, selector]
  );

  return useSyncExternalStore(
    editor ? subscribe : NOOP_SUBSCRIBE,
    getSnapshot,
    getServerSnapshot
  );
}
