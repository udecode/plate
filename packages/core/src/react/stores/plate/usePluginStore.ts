import { useStoreWithEqualityFn } from 'zustand/traditional';

import { getPluginStore as getInternalPluginStore } from '../../../internal/plugin/pluginStore';
import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  AnyPluginBase,
  DefinitionOf,
  InferPluginStoreState,
  InferSelectors,
  PluginSelectorArgs,
  PluginSelectorReturn,
  PluginReference,
} from '../../../lib';
import type { PlateEditor } from '../../editor';
import type { AnyResolvedPlatePlugin, AnyPlatePlugin } from '../../plugin';
import { useEditor } from './createPlateStore';

type PluginStoreDescriptor = (
  | AnyBasePlugin
  | AnyResolvedPlatePlugin
  | AnyPlatePlugin
  | AnyPluginBase
) &
  PluginReference;

type PluginStoreKey<C extends AnyBasePluginDefinition> =
  | keyof InferPluginStoreState<C>
  | keyof InferSelectors<C>;

type PluginStoreValue<
  C extends AnyBasePluginDefinition,
  K,
> = K extends keyof InferSelectors<C>
  ? PluginSelectorReturn<InferSelectors<C>[K]>
  : K extends keyof InferPluginStoreState<C>
    ? InferPluginStoreState<C>[K]
    : never;

type PluginStoreArgs<
  C extends AnyBasePluginDefinition,
  K,
> = K extends keyof InferSelectors<C>
  ? PluginSelectorArgs<InferSelectors<C>[K]>
  : [];

type ErasedPluginStateSelector = {
  bivarianceHack(state: unknown): unknown;
}['bivarianceHack'];

/**
 * Subscribe to one plugin state field or named selector. Pass a selector
 * callback to derive directly from the plugin state. The plugin descriptor
 * carries the state and selector contract, so name-only objects are rejected.
 *
 * @example
 *   const value = usePluginStore(plugin, 'value');
 *   const doubleValue = usePluginStore(plugin, 'doubleValue', 2);
 *   const label = usePluginStore(plugin, (state) => state.label);
 */
export function usePluginStore<
  P extends PluginStoreDescriptor,
  K extends PluginStoreKey<DefinitionOf<P>> = PluginStoreKey<DefinitionOf<P>>,
>(
  plugin: P,
  key: K,
  ...args: PluginStoreArgs<DefinitionOf<P>, K>
): PluginStoreValue<DefinitionOf<P>, K>;
export function usePluginStore<P extends PluginStoreDescriptor, U = unknown>(
  plugin: P,
  selector: (state: InferPluginStoreState<DefinitionOf<P>>) => U,
  options?: {
    // Editor id. Default is the closest one.
    id?: string;
    // Equality function. Default is strict equality.
    equalityFn?: (a: U, b: U) => boolean;
  }
): U;

export function usePluginStore(
  plugin: PluginStoreDescriptor,
  keyOrSelector: PropertyKey | ErasedPluginStateSelector,
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
  K extends PluginStoreKey<DefinitionOf<P>> = PluginStoreKey<DefinitionOf<P>>,
>(
  editor: PlateEditor,
  plugin: P,
  key: K,
  ...args: PluginStoreArgs<DefinitionOf<P>, K>
): PluginStoreValue<DefinitionOf<P>, K>;
export function useEditorPluginStore<
  P extends PluginStoreDescriptor,
  U = unknown,
>(
  editor: PlateEditor,
  plugin: P,
  selector: (state: InferPluginStoreState<DefinitionOf<P>>) => U,
  options?: {
    // Equality function. Default is strict equality.
    equalityFn?: (a: U, b: U) => boolean;
  }
): U;
export function useEditorPluginStore(
  editor: PlateEditor,
  plugin: PluginStoreDescriptor,
  keyOrSelector: PropertyKey | ErasedPluginStateSelector,
  ...args: unknown[]
): unknown {
  return useResolvedPluginStore(editor, plugin, keyOrSelector, args);
}

function useResolvedPluginStore(
  editor: PlateEditor,
  plugin: PluginStoreDescriptor,
  keyOrSelector: PropertyKey | ErasedPluginStateSelector,
  args: readonly unknown[]
): unknown {
  const portal = editor.plugin(plugin);

  if (!portal.installed) {
    throw new Error(`Plate plugin "${plugin.name}" is not installed.`);
  }
  const store = getInternalPluginStore(editor, portal.name);

  if (!store) {
    throw new Error(`Plate plugin "${plugin.name}" store is not installed.`);
  }

  let equalityFn: ((a: unknown, b: unknown) => boolean) | undefined;
  let selector: (state: unknown) => unknown;

  if (typeof keyOrSelector === 'function') {
    const [options = {}] = args as [
      { equalityFn?: (a: unknown, b: unknown) => boolean }?,
    ];

    selector = keyOrSelector;
    ({ equalityFn } = options);
  } else {
    const namedSelector = (store.selectors as Record<PropertyKey, unknown>)[
      keyOrSelector
    ] as ((state: unknown, ...selectorArgs: unknown[]) => unknown) | undefined;
    selector = namedSelector
      ? (state: unknown) => namedSelector(state, ...args)
      : (state: unknown) => {
          if (typeof state !== 'object' || state === null) {
            throw new Error(
              `Plate plugin "${plugin.name}" store state must be an object.`
            );
          }
          if (!Object.hasOwn(state, keyOrSelector)) {
            throw new Error(
              `Plate plugin "${plugin.name}" has no state field or selector "${String(keyOrSelector)}".`
            );
          }

          return Reflect.get(state, keyOrSelector);
        };
  }

  return useStoreWithEqualityFn(store.base.store, selector, equalityFn);
}
