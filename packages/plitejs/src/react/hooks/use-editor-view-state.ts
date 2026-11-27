import { useCallback, useSyncExternalStore } from 'react';

import type { EditorStateView, ValueOf } from '../..';
import {
  type AnyEditor,
  subscribeEditorViewState,
} from '../editable/runtime-editor-api';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

const NOOP_SUBSCRIBE = () => () => {};

/** Options for explicit editor view-state selectors. */
export interface EditorViewStateSelectorOptions<T> {
  equalityFn?: (a: T, b: T) => boolean;
}

export function useOptionalEditorViewState<T>(
  editor: AnyEditor | null,
  selector: (view: EditorStateView['view']) => T,
  nullFallback: T,
  readOnServer = false
): T {
  const subscribe = useCallback(
    (listener: () => void) =>
      editor ? subscribeEditorViewState(editor, listener) : () => {},
    [editor]
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

/**
 * Subscribe to a derived view-state value from an explicit editor instance.
 *
 * View state covers editable facts such as read-only, focus, and composition.
 */
export function useEditorViewState<T, TEditor extends AnyEditor = AnyEditor>(
  editor: TEditor,
  selector: (view: EditorStateView<ValueOf<TEditor>>['view']) => T,
  { equalityFn }: EditorViewStateSelectorOptions<T> = {}
): T {
  const readSelectedState = useCallback(
    () => editor.read((state) => selector(state.view)),
    [editor, selector]
  );
  const [selectedState, update] = useGenericSelector(
    readSelectedState,
    equalityFn
  );

  useIsomorphicLayoutEffect(() => {
    update();

    return subscribeEditorViewState(editor, update);
  }, [editor, update]);

  return selectedState;
}
