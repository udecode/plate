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

const withCapturedId = <TOptions extends Record<string, unknown>>(
  options: TOptions,
  id: unknown
): TOptions => {
  const copy: Record<string, unknown> = {};

  for (const key of Object.keys(options)) {
    copy[key] = key === 'id' ? id : options[key];
  }

  return copy as TOptions;
};

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
export function useCreateEditor(
  options?: undefined,
  deps?: DependencyList
): Editor;

export function useCreateEditor<
  const TOptions extends CreateEditorOptions<any, readonly unknown[]> & {
    plugins: readonly unknown[];
  },
>(
  options: CheckedEditorOptions<TOptions, CreateEditorOptions>,
  deps?: DependencyList
): Editor<EditorValueFromOptions<TOptions>, PluginsFromOptions<TOptions>>;

export function useCreateEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(
  options: CreateEditorOptions<V, TPlugins>,
  deps?: DependencyList
): Editor<V, TPlugins>;

export function useCreateEditor(
  options: CreateEditorOptions<Value, readonly unknown[]> | undefined,
  deps?: DependencyList
): Editor;

export function useCreateEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(
  options: CreateEditorOptions<V, TPlugins> = {},
  deps: DependencyList = []
): Editor<V, TPlugins> {
  // Later renders skip createEditor, so check each render's options here.
  assertEditorOptions(options, REACT_EDITOR_OPTION_KEYS);
  const hasId = Object.hasOwn(options, 'id');
  const editorId = hasId ? options.id : undefined;
  const owner = useMemo(
    () =>
      createEditorOwner(() =>
        createDormantReactEditor(
          hasId ? withCapturedId(options, editorId) : options
        )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Caller-supplied deps and options.id own the editor lifetime.
    [editorId, ...deps]
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
