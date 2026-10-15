import { type DependencyList, useMemo } from 'react';

import type { PluginsFromOptions, EditorValueFromOptions, Value } from '../..';
import {
  assertEditorOptions,
  type CheckedEditorOptions,
} from '../../internal/editor-options';
import {
  type CreateEditorOptions,
  createEditor,
  type Editor,
  REACT_EDITOR_OPTION_KEYS,
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
  // Strict Mode runs a memo factory twice and keeps the first result, so the
  // factory returns a getter and the component builds one editor. A second
  // editor would activate its plugins again, and a Yjs binding refuses it.
  const createGetter = () => {
    let editor: Editor<V, TPlugins> | undefined;

    return () => (editor ??= createEditor(options));
  };
  // The caller-supplied list intentionally owns the component editor lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getEditor = useMemo(createGetter, deps);

  return getEditor();
}
