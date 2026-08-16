import { useCallback } from 'react';
import type { EditorStateView, ValueOf } from '@platejs/plite';
import {
  type AnyEditor,
  subscribeEditorViewState,
} from '../editable/runtime-editor-api';

import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options for explicit editor view-state selectors. */
export interface EditorViewStateSelectorOptions<T> {
  equalityFn?: (a: T | null, b: T) => boolean;
}

const refEquality = <T>(a: T | null, b: T) => a === b;

/**
 * Subscribe to a derived view-state value from an explicit editor instance.
 *
 * View state covers editable facts such as read-only, focus, and composition.
 */
export function useEditorViewState<T, TEditor extends AnyEditor = AnyEditor>(
  editor: TEditor,
  selector: (view: EditorStateView<ValueOf<TEditor>>['view']) => T,
  { equalityFn = refEquality }: EditorViewStateSelectorOptions<T> = {}
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
