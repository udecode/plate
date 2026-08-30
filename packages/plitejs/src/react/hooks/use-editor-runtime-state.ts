import { useCallback, useRef } from 'react';

import type {
  Editor,
  EditorCommit,
  EditorStateView,
  ExtensionsOf,
  ValueOf,
} from '../..';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options for explicit editor runtime-state selectors. */
export interface EditorRuntimeStateSelectorOptions<
  T,
  TEditor extends Editor<any, any> = Editor<any, any>,
> {
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (change?: EditorCommit<ValueOf<TEditor>>) => boolean;
}

const refEquality = <T>(a: T | null, b: T) => a === b;

/**
 * Subscribe to a derived state value from an explicit editor instance.
 *
 * Use this for chrome that owns or receives an editor but is outside a
 * `<Plite>` provider. Commit-driven selectors invalidate synchronously. Inside
 * provider descendants, prefer `useEditorState`.
 */
export function useEditorRuntimeState<
  T,
  TEditor extends Editor<any, any> = Editor<any, any>,
>(
  editor: TEditor,
  selector: (
    state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>
  ) => T,
  {
    equalityFn = refEquality,
    shouldUpdate,
  }: EditorRuntimeStateSelectorOptions<T, TEditor> = {}
): T {
  const readSelectedState = useCallback(
    () =>
      editor.read((state) =>
        selector(
          state as unknown as EditorStateView<
            ValueOf<TEditor>,
            ExtensionsOf<TEditor>
          >
        )
      ),
    [editor, selector]
  );
  const [selectedState, update] = useGenericSelector(
    readSelectedState,
    equalityFn
  );
  const shouldUpdateRef = useRef(shouldUpdate);

  useIsomorphicLayoutEffect(() => {
    const changed = shouldUpdateRef.current !== shouldUpdate;

    shouldUpdateRef.current = shouldUpdate;

    if (changed) update();
  }, [shouldUpdate, update]);

  const updateWithCommit = useCallback(
    (change: EditorCommit<ValueOf<TEditor>>) => {
      if (shouldUpdateRef.current && !shouldUpdateRef.current(change)) {
        return;
      }

      update();
    },
    [update]
  );

  useIsomorphicLayoutEffect(() => {
    update();

    return editor.subscribeCommit((change) => {
      updateWithCommit(change);
    });
  }, [editor, update, updateWithCommit]);

  return selectedState;
}
