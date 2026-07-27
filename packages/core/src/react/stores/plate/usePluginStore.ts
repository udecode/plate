import { useStoreWithEqualityFn } from 'zustand/traditional';

import type {
  AnyPluginConfig,
  InferPluginStoreState,
  InferSelectors,
  PluginSelectorArgs,
  PluginSelectorReturn,
  PluginReference,
} from '../../../lib';
import type { PlateEditor } from '../../editor';

import { getPluginStore as getInternalPluginStore } from '../../../internal/plugin/pluginStore';
import { useEditor } from './createPlateStore';

type PluginStoreDescriptor<C extends AnyPluginConfig = AnyPluginConfig> =
  PluginReference & {
    readonly __config: C;
  };

type PluginStoreKey<C extends AnyPluginConfig> =
  | keyof InferPluginStoreState<C>
  | keyof InferSelectors<C>;

type PluginStoreValue<
  C extends AnyPluginConfig,
  K,
> = K extends keyof InferSelectors<C>
  ? PluginSelectorReturn<InferSelectors<C>[K]>
  : K extends keyof InferPluginStoreState<C>
    ? InferPluginStoreState<C>[K]
    : never;

type PluginStoreArgs<
  C extends AnyPluginConfig,
  K,
> = K extends keyof InferSelectors<C>
  ? PluginSelectorArgs<InferSelectors<C>[K]>
  : [];

/**
 * Subscribe to one plugin state field or named selector. Pass a selector
 * callback to derive directly from the plugin state. The plugin descriptor
 * carries the state and selector contract, so key-only objects are rejected.
 *
 * @example
 *   const value = usePluginStore(plugin, 'value');
 *   const doubleValue = usePluginStore(plugin, 'doubleValue', 2);
 *   const label = usePluginStore(plugin, (state) => state.label);
 */
export function usePluginStore<
  P extends PluginStoreDescriptor,
  K extends PluginStoreKey<P['__config']> = PluginStoreKey<P['__config']>,
>(
  plugin: P,
  key: K,
  ...args: PluginStoreArgs<P['__config'], K>
): PluginStoreValue<P['__config'], K>;
export function usePluginStore<P extends PluginStoreDescriptor, U = unknown>(
  plugin: P,
  selector: (state: InferPluginStoreState<P['__config']>) => U,
  options?: {
    // Editor id. Default is the closest one.
    id?: string;
    // Equality function. Default is strict equality.
    equalityFn?: (a: U, b: U) => boolean;
  }
): U;

export function usePluginStore(
  plugin: PluginStoreDescriptor,
  keyOrSelector: PropertyKey | ((state: object) => unknown),
  ...args: unknown[]
): unknown {
  const options =
    typeof keyOrSelector === 'function'
      ? (args[0] as { id?: string } | undefined)
      : undefined;
  const editor = useEditor({ id: options?.id });

  return useResolvedPluginStore(editor, plugin, keyOrSelector, args);
}

export function useEditorPluginStore<
  P extends PluginStoreDescriptor,
  K extends PluginStoreKey<P['__config']> = PluginStoreKey<P['__config']>,
>(
  editor: PlateEditor,
  plugin: P,
  key: K,
  ...args: PluginStoreArgs<P['__config'], K>
): PluginStoreValue<P['__config'], K>;
export function useEditorPluginStore<
  P extends PluginStoreDescriptor,
  U = unknown,
>(
  editor: PlateEditor,
  plugin: P,
  selector: (state: InferPluginStoreState<P['__config']>) => U,
  options?: {
    // Equality function. Default is strict equality.
    equalityFn?: (a: U, b: U) => boolean;
  }
): U;
export function useEditorPluginStore(
  editor: PlateEditor,
  plugin: PluginStoreDescriptor,
  keyOrSelector: PropertyKey | ((state: object) => unknown),
  ...args: unknown[]
): unknown {
  return useResolvedPluginStore(editor, plugin, keyOrSelector, args);
}

function useResolvedPluginStore(
  editor: PlateEditor,
  plugin: PluginStoreDescriptor,
  keyOrSelector: PropertyKey | ((state: object) => unknown),
  args: readonly unknown[]
): unknown {
  const installed = editor.getPlugin(plugin);
  const store = getInternalPluginStore(editor, installed.key);

  if (!store) {
    throw new Error(`Plate plugin "${plugin.key}" store is not installed.`);
  }

  if (typeof keyOrSelector === 'function') {
    const [{ equalityFn } = {}] = args as [
      { equalityFn?: (a: unknown, b: unknown) => boolean }?,
    ];

    return useStoreWithEqualityFn(store.base.store, keyOrSelector, equalityFn);
  }

  const namedSelector = store.selectors[keyOrSelector as never] as
    | ((state: object, ...selectorArgs: unknown[]) => unknown)
    | undefined;
  const selector = namedSelector
    ? (state: object) => namedSelector(state, ...args)
    : (state: Record<PropertyKey, unknown>) => {
        if (!Object.hasOwn(state, keyOrSelector)) {
          throw new Error(
            `Plate plugin "${plugin.key}" has no state field or selector "${String(keyOrSelector)}".`
          );
        }

        return state[keyOrSelector];
      };

  return useStoreWithEqualityFn(store.base.store, selector);
}
