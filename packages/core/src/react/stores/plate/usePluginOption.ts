import type { TEqualityChecker } from 'zustand-x';

import { useStoreWithEqualityFn } from 'zustand/traditional';

import type {
  AnyPluginConfig,
  InferOptions,
  InferSelectors,
  WithRequiredKey,
} from '../../../lib';
import type { PlateEditor } from '../../editor';
import type { InferConfig, PlatePlugin } from '../../plugin';

import { getPluginOptionsStore } from '../../../internal/plugin/pluginOptionsStore';
import { useEditor } from './createPlateStore';

type PluginOptionInput =
  | PlatePlugin<AnyPluginConfig>
  | WithRequiredKey<AnyPluginConfig>;

type PluginOptionConfig<P> =
  InferConfig<P> extends infer C extends AnyPluginConfig ? C : never;

type SelectorFn<T> = Extract<NonNullable<T>, (...args: any[]) => any>;

type SelectorArgs<T> =
  SelectorFn<T> extends (...args: infer A) => any ? A : never;

type SelectorReturn<T> =
  SelectorFn<T> extends (...args: any[]) => infer R ? R : never;

type PluginOptionKey<C extends AnyPluginConfig> =
  | 'state'
  | keyof InferOptions<C>
  | keyof InferSelectors<C>;

type PluginOptionValue<C extends AnyPluginConfig, K> = K extends 'state'
  ? InferOptions<C>
  : K extends keyof InferSelectors<C>
    ? SelectorReturn<InferSelectors<C>[K]>
    : K extends keyof InferOptions<C>
      ? InferOptions<C>[K]
      : never;

type PluginOptionArgs<C extends AnyPluginConfig, K> = [
  ...(K extends keyof InferSelectors<C>
    ? SelectorArgs<InferSelectors<C>[K]>
    : []),
  TEqualityChecker<PluginOptionValue<C, K>>?,
];

/**
 * Hook to access plugin options. For usage outside `<Plate>`, use
 * `useEditorPluginOption` instead.
 * The plugin must be installed in the target editor.
 *
 * @example
 *   const value = usePluginOption(plugin, 'value');
 *   const doubleValue = usePluginOption(plugin, 'doubleValue', 2);
 */
export function usePluginOption<
  P extends PluginOptionInput,
  C extends AnyPluginConfig = PluginOptionConfig<P>,
  K extends PluginOptionKey<C> = PluginOptionKey<C>,
>(plugin: P, key: K, ...args: PluginOptionArgs<C, K>): PluginOptionValue<C, K>;
export function usePluginOption(
  plugin: PluginOptionInput,
  key: string,
  ...args: unknown[]
): unknown {
  const editor = useEditor();

  return useEditorPluginOption(editor, plugin, key as any, ...(args as any));
}

export function useEditorPluginOption<
  P extends PluginOptionInput,
  C extends AnyPluginConfig = PluginOptionConfig<P>,
  K extends PluginOptionKey<C> = PluginOptionKey<C>,
>(
  editor: PlateEditor,
  plugin: P,
  key: K,
  ...args: PluginOptionArgs<C, K>
): PluginOptionValue<C, K>;
export function useEditorPluginOption(
  editor: PlateEditor,
  plugin: PluginOptionInput,
  key: string,
  ...args: unknown[]
): unknown {
  const installed = editor.getPlugin(plugin);
  const store = getPluginOptionsStore(editor, installed.key);

  if (!store) {
    throw new Error(`Plate plugin "${plugin.key}" options are not installed.`);
  }

  if (
    key !== 'state' &&
    !(key in store.get('state')) &&
    !(key in store.selectors)
  ) {
    editor.api.debug.error(
      `usePluginOption: ${key} option is not defined in plugin ${plugin.key}`,
      'OPTION_UNDEFINED'
    );
    return;
  }

  let equalityFn: TEqualityChecker<unknown> | undefined;
  let selector: (state: InferOptions<AnyPluginConfig>) => unknown;

  if (key === 'state') {
    equalityFn = args[0] as TEqualityChecker<unknown> | undefined;
    selector = (state) => state;
  } else if (key in store.selectors) {
    const maybeEqualityFn = args.at(-1);

    equalityFn =
      typeof maybeEqualityFn === 'function'
        ? (maybeEqualityFn as TEqualityChecker<unknown>)
        : undefined;
    const selectorArgs = equalityFn ? args.slice(0, -1) : args;

    selector = () => (store.get as any)(key, ...selectorArgs);
  } else {
    equalityFn = args[0] as TEqualityChecker<unknown> | undefined;
    selector = (state) => state[key as keyof typeof state];
  }

  return useStoreWithEqualityFn(store.store, selector, equalityFn);
}

/**
 * Use a Zustand store selector. The plugin must be installed in the target
 * editor.
 *
 * @example
 *   const name = usePluginOptions(plugin, (state) => state.name, equalityFn);
 */
export function usePluginOptions<
  P extends PluginOptionInput,
  C extends AnyPluginConfig = PluginOptionConfig<P>,
  U = unknown,
>(
  plugin: P,
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
  const editor = useEditor({ id });

  return useEditorPluginOptions(editor, plugin, selector, {
    equalityFn,
  });
}

export function useEditorPluginOptions<
  P extends PluginOptionInput,
  C extends AnyPluginConfig = PluginOptionConfig<P>,
  U = unknown,
>(
  editor: PlateEditor,
  plugin: P,
  selector: (state: InferOptions<C>) => U,
  {
    equalityFn,
  }: {
    // Equality function. Default is strict equality.
    equalityFn?: (a: U, b: U) => boolean;
  } = {}
): U {
  const installed = editor.getPlugin(plugin);
  const store = getPluginOptionsStore(editor, installed.key);

  if (!store) {
    throw new Error(`Plate plugin "${plugin.key}" options are not installed.`);
  }

  return useStoreWithEqualityFn(store.store, selector, equalityFn);
}
