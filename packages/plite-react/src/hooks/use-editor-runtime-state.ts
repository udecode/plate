import { useCallback } from 'react';
import type {
  Editor,
  EditorCommit,
  EditorStateView,
  Operation,
  ValueOf,
} from '@platejs/plite';

import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options for explicit editor runtime-state selectors. */
export interface EditorRuntimeStateSelectorOptions<
  T,
  TEditor extends Editor<any> = Editor<any>,
> {
  deps?: readonly unknown[];
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (
    change?: EditorCommit<ValueOf<TEditor>>,
    operations?: readonly Operation<ValueOf<TEditor>>[]
  ) => boolean;
}

const refEquality = <T>(a: T | null, b: T) => a === b;

/**
 * Subscribe to a derived state value from an explicit editor instance.
 *
 * Use this for chrome that owns or receives an editor but is outside a
 * `<Plite>` provider. Inside provider descendants, prefer `useEditorState`.
 */
export function useEditorRuntimeState<
  T,
  TEditor extends Editor<any> = Editor<any>,
>(
  editor: TEditor,
  selector: (state: EditorStateView<ValueOf<TEditor>>) => T,
  {
    deps,
    equalityFn = refEquality,
    shouldUpdate,
  }: EditorRuntimeStateSelectorOptions<T, TEditor> = {}
): T {
  const selectorDeps = deps ? [editor, ...deps] : [editor, selector];
  const readSelectedState = useCallback(
    () => editor.read((state) => selector(state)),
    // `deps` intentionally owns inline selector closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectorDeps
  );
  const [selectedState, update] = useGenericSelector(
    readSelectedState,
    equalityFn
  );
  const updateWithCommit = useCallback(
    (change: EditorCommit<ValueOf<TEditor>>) => {
      if (shouldUpdate && !shouldUpdate(change, change.operations)) {
        return;
      }

      update();
    },
    [shouldUpdate, update]
  );

  useIsomorphicLayoutEffect(() => {
    update();

    return editor.subscribeCommit((change) => {
      updateWithCommit(change as EditorCommit<ValueOf<TEditor>>);
    });
  }, [editor, update, updateWithCommit]);

  return selectedState;
}
