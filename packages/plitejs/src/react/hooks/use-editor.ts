import { type DependencyList, useMemo } from 'react';

import type { PluginsFromOptions, EditorValueFromOptions, Value } from '../..';
import {
  type CreateEditorOptions,
  createEditor,
  type Editor,
} from '../plugin/with-react';

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
 * editor commands instead of changing props. Use `createEditor` when an
 * editor must be created outside React ownership.
 */
export function useEditor<
  const TOptions extends UseEditorOptions<any, readonly unknown[]> & {
    plugins: readonly unknown[];
  },
>(
  options: TOptions,
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
  // The caller-supplied list intentionally owns the component editor lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const editor = useMemo(() => createEditor(options), deps);

  return editor;
}
