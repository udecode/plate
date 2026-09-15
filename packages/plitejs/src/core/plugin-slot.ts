import type {
  EditorResolvedInstalledPlugins,
  PluginDependencyContractReference,
  PluginReference,
  PluginInput,
} from '../interfaces/editor';
import type {
  EditorSchemaPluginProvider,
  SchemaPluginsOf,
} from '../interfaces/schema';
import { definePlugin } from './plugin';

const PLUGIN_SLOT_INPUTS = new WeakMap<object, PluginInput>();

type PluginTuple<TInput> = TInput extends readonly unknown[]
  ? TInput
  : readonly [TInput];

export type PluginSlotValue<
  TKey extends string,
  TInput extends PluginInput,
> = PluginDependencyContractReference<
  Readonly<{
    direct: Readonly<{ name: `slot:${TKey}` }>;
    installed: EditorResolvedInstalledPlugins<PluginTuple<TInput>>[number];
  }>
> &
  PluginReference &
  EditorSchemaPluginProvider<() => SchemaPluginsOf<TInput>> & {
    name: `slot:${TKey}`;
  };

export type PluginSlot<TKey extends string> = Readonly<{
  key: TKey;
  of: <const TInput extends PluginInput>(
    input: TInput
  ) => PluginSlotValue<TKey, TInput>;
}>;

/**
 * Read the configured input owned by a nominal slot descriptor.
 *
 * @internal
 */
export const getPluginSlotInput = (
  plugin: PluginReference
): PluginInput | undefined => PLUGIN_SLOT_INPUTS.get(plugin);

/**
 * Define a named plugin boundary that can be replaced as one atomic unit.
 */
export const definePluginSlot = <const TKey extends string>(
  key: TKey
): PluginSlot<TKey> => {
  if (!key) throw new Error('Editor plugin slot key cannot be empty.');
  const values = new WeakMap<object, PluginReference>();

  const of = <const TInput extends PluginInput>(input: TInput) => {
    const known = values.get(input);

    if (known) {
      return known as unknown as PluginSlotValue<TKey, TInput>;
    }
    const plugin = definePlugin(`slot:${key}`, {});

    PLUGIN_SLOT_INPUTS.set(plugin, input);
    values.set(input, plugin);

    return plugin as unknown as PluginSlotValue<TKey, TInput>;
  };

  return Object.freeze({
    key,
    of,
  });
};
