import {
  type DependencyList,
  useEffect,
  useInsertionEffect,
  useMemo,
} from 'react';

import type { PluginsFromOptions, EditorValueFromOptions, Value } from '../..';
import { createEditorOwner, type EditorOwner } from '../../core/editor-owner';
import {
  assertEditorOptions,
  type CheckedEditorOptions,
} from '../../internal/editor-options';
import {
  type CreateEditorOptions,
  createDormantReactEditor,
  type Editor,
  REACT_EDITOR_OPTION_KEYS,
} from '../plugin/with-react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options used to create a component-owned React editor. */
export type UseEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
> = CreateEditorOptions<V, TPlugins>;

/**
 * Creates one React editor instance for the component lifetime.
 *
 * Use this inside a component or custom hook that owns the editor lifetime.
 * `initialValue` seeds the editor once; replace document content later through
 * editor commands instead of changing props. Plugins take resources outside
 * the editor, such as a Yjs document, when React commits the component, and
 * give them back when it unmounts or `deps` change. Use `createEditor` when an
 * editor must be created outside React ownership.
 */
export function useEditor<
  const TOptions extends UseEditorOptions<any, readonly unknown[]> & {
    plugins: readonly unknown[];
  },
>(
  options: CheckedEditorOptions<TOptions, UseEditorOptions>,
  deps?: DependencyList
): Editor<EditorValueFromOptions<TOptions>, PluginsFromOptions<TOptions>>;

export function useEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(
  options?: UseEditorOptions<V, TPlugins>,
  deps?: DependencyList
): Editor<V, TPlugins>;

export function useEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(
  options: UseEditorOptions<V, TPlugins> = {},
  deps: DependencyList = []
): Editor<V, TPlugins> {
  // Later renders skip createEditor, so check each render's options here.
  assertEditorOptions(options, REACT_EDITOR_OPTION_KEYS);
  const owner = useMemo(
    () => createEditorOwner(() => createDormantReactEditor(options)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Caller-supplied deps own the editor lifetime.
    deps
  );

  useEditorOwner(owner);

  return owner.editor;
}

/** @internal */
export const useEditorOwner = (owner: EditorOwner) => {
  useInsertionEffect(() => () => owner.retire(), [owner]);
  useIsomorphicLayoutEffect(() => {
    owner.startUnlessViewStarted();
    owner.layoutConnected();

    return () => owner.layoutDisconnected();
  }, [owner]);
  useEffect(() => {
    owner.passiveConnected();

    return () => owner.passiveDisconnected();
  }, [owner]);
};
