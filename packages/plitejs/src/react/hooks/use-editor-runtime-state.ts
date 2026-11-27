import { useCallback, useRef } from 'react';

import type {
  Editor,
  EditorCommit,
  EditorStateView,
  PluginsOf,
  ValueOf,
} from '../..';
import {
  commitMatchesSelectorDependencies,
  type EditorSelectorDependencies,
  normalizeSelectorDependencies,
  sameSelectorDependencies,
} from '../../core/selector-dependencies';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options for explicit editor runtime-state selectors. */
export interface EditorRuntimeStateSelectorOptions<T = unknown> {
  dependsOn?: EditorSelectorDependencies;
  equalityFn?: (a: T, b: T) => boolean;
}

/**
 * Subscribe to a derived state value from an explicit editor instance.
 *
 * Use this for chrome that owns or receives an editor but is outside a
 * `<EditorRoot>` provider. Commit-driven selectors invalidate synchronously. Inside
 * provider descendants, prefer `useEditorState`.
 */
export function useEditorRuntimeState<
  T,
  TEditor extends Editor<any, any> = Editor<any, any>,
>(
  editor: TEditor,
  selector: (state: EditorStateView<ValueOf<TEditor>, PluginsOf<TEditor>>) => T,
  { dependsOn, equalityFn }: EditorRuntimeStateSelectorOptions<T> = {}
): T {
  const normalizedDeps = normalizeSelectorDependencies(dependsOn);
  const readSelectedState = useCallback(
    () =>
      editor.read((state) =>
        selector(
          state as unknown as EditorStateView<
            ValueOf<TEditor>,
            PluginsOf<TEditor>
          >
        )
      ),
    [editor, selector]
  );
  const [selectedState, update] = useGenericSelector(
    readSelectedState,
    equalityFn
  );
  const depsRef = useRef(normalizedDeps);

  useIsomorphicLayoutEffect(() => {
    const changed = !sameSelectorDependencies(depsRef.current, normalizedDeps);

    depsRef.current = normalizedDeps;

    if (changed) update();
  }, [normalizedDeps, update]);

  const updateWithCommit = useCallback(
    (change: EditorCommit<ValueOf<TEditor>>) => {
      if (!commitMatchesSelectorDependencies(editor, change, depsRef.current)) {
        return;
      }

      update();
    },
    [editor, update]
  );

  useIsomorphicLayoutEffect(() => {
    update();

    return editor.subscribeCommit((change) => {
      updateWithCommit(change);
    });
  }, [editor, update, updateWithCommit]);

  return selectedState;
}
