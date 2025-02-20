import type { TEqualityChecker } from 'zustand-x';

import { useStoreSelect, useStoreValue } from 'zustand-x';

import type {
  AnyPluginConfig,
  InferOptions,
  InferSelectors,
  WithRequiredKey,
} from '../../../lib';
import type { PlateEditor } from '../../editor';

import { useEditorRef } from './createPlateStore';

/**
 * Hook to access plugin options. For usage outside `<Plate>`, use
 * `useEditorPluginOption` instead.
 *
 * @example
 *   const value = usePluginOption(plugin, 'value');
 *   const doubleValue = usePluginOption(plugin, 'doubleValue', 2);
 */
export function usePluginOption<
  C extends AnyPluginConfig,
  StateType extends InferOptions<C>,
  TSelectors extends InferSelectors<C>,
  K extends keyof StateType | keyof TSelectors | 'state',
>(
  plugin: WithRequiredKey<C>,
  key: K,
  ...args: [
    ...(K extends keyof TSelectors ? Parameters<TSelectors[K]> : unknown[]),
    TEqualityChecker<
      K extends 'state'
        ? StateType
        : K extends keyof TSelectors
          ? ReturnType<TSelectors[K]>
          : K extends keyof StateType
            ? StateType[K]
            : never
    >?,
  ]
): K extends 'state'
  ? StateType
  : K extends keyof TSelectors
    ? ReturnType<TSelectors[K]>
    : K extends keyof StateType
      ? StateType[K]
      : never {
  const editor = useEditorRef();

  return useEditorPluginOption(editor, plugin, key, ...args);
}

export function useEditorPluginOption<
  C extends AnyPluginConfig,
  StateType extends InferOptions<C>,
  TSelectors extends InferSelectors<C>,
  K extends keyof StateType | keyof TSelectors | 'state',
>(
  editor: PlateEditor,
  plugin: WithRequiredKey<C>,
  key: K,
  ...args: [
    ...(K extends keyof TSelectors ? Parameters<TSelectors[K]> : unknown[]),
    TEqualityChecker<
      K extends 'state'
        ? StateType
        : K extends keyof TSelectors
          ? ReturnType<TSelectors[K]>
          : K extends keyof StateType
            ? StateType[K]
            : never
    >?,
  ]
): K extends 'state'
  ? StateType
  : K extends keyof TSelectors
    ? ReturnType<TSelectors[K]>
    : K extends keyof StateType
      ? StateType[K]
      : never {
  const store = editor.getOptionsStore(plugin);

  if (!store) {
    return undefined as any;
  }

  if (!(key in store.get('state')) && !(key in store.selectors)) {
    editor.api.debug.error(
      `usePluginOption: ${key as any} option is not defined in plugin ${plugin.key}`,
      'OPTION_UNDEFINED'
    );
    return undefined as any;
  }

  return (useStoreValue as any)(store, key, ...args);
}

/**
 * Use zustand store selector.
 *
 * @example
 *   const name = usePluginOptions(plugin, (state) => state.name, equalityFn);
 */
export function usePluginOptions<C extends AnyPluginConfig, U>(
  plugin: WithRequiredKey<C>,
  selector: (state: InferOptions<C>) => U,
  {
    id,
    equalityFn,
  }: {
    // Editor id. Default is the closest one.
    id?: string;
    // Equality function. Default is strict equality.
    equalityFn?: (a: U, b: U) => boolean;
  } = {}
): U {
  const editor = useEditorRef(id);

  return useEditorPluginOptions(editor, plugin, selector, {
    equalityFn,
  });
}

export function useEditorPluginOptions<C extends AnyPluginConfig, U>(
  editor: PlateEditor,
  plugin: WithRequiredKey<C>,
  selector: (state: InferOptions<C>) => U,
  {
    equalityFn,
  }: {
    // Equality function. Default is strict equality.
    equalityFn?: (a: U, b: U) => boolean;
  } = {}
): U {
  const store = editor.getOptionsStore(plugin);

  if (!store) {
    return undefined as any;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useStoreSelect(store, selector, equalityFn);
}
