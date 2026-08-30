import { type DependencyList, useMemo } from 'react';

import type {
  EditorExtensionsFromOptions,
  EditorValueFromOptions,
  Value,
} from '../..';
import {
  type CreateEditorOptions,
  createEditor,
  type Editor,
} from '../plugin/with-react';

/** Options used to create a component-owned React editor. */
export type UseEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = CreateEditorOptions<V, TExtensions>;

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
    extensions: readonly unknown[];
  },
>(
  options: TOptions,
  deps?: DependencyList
): Editor<
  EditorValueFromOptions<TOptions>,
  EditorExtensionsFromOptions<TOptions>
>;

export function useEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options?: UseEditorOptions<V, TExtensions>,
  deps?: DependencyList
): Editor<V, TExtensions>;

export function useEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options: UseEditorOptions<V, TExtensions> = {},
  deps: DependencyList = []
): Editor<V, TExtensions> {
  // The caller-supplied list intentionally owns the component editor lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const editor = useMemo(() => createEditor(options), deps);

  return editor;
}
