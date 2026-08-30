import type { Pluggable, Preset, Settings } from 'unified';

import type { NormalizePluginState } from '../../../core';

export const REMARK_MDX_TAG = 'remarkMdx';

type Callable = (...args: never[]) => unknown;
const pluginTags = new WeakMap<object, string>();

export const tagRemarkPlugin = <T extends Callable>(
  pluginFn: T,
  tag: string
) => {
  pluginTags.set(pluginFn, tag);

  return pluginFn;
};

type ConfiguredPluggable = NormalizePluginState<Pluggable>;
type ConfiguredPluginTuple = Extract<ConfiguredPluggable, readonly unknown[]>;
type PluginTuple = Extract<Pluggable, readonly unknown[]>;
type MaterializableUnsafe = NormalizePluginState<
  NonNullable<Settings['unsafe']>[number]
>;
type MaterializableSettings = Omit<Settings, 'join' | 'unsafe'> &
  Readonly<{
    join?: ReadonlyArray<NonNullable<Settings['join']>[number]> | null;
    unsafe?: readonly MaterializableUnsafe[] | null;
  }>;

const materializeConstructs = (
  constructs: MaterializableUnsafe['inConstruct']
) =>
  typeof constructs === 'string' || constructs == null
    ? constructs
    : [...constructs];

export const materializeMarkdownSettings = (
  settings: MaterializableSettings
): Settings => ({
  ...settings,
  join: settings.join ? [...settings.join] : settings.join,
  unsafe: settings.unsafe
    ? settings.unsafe.map(
        ({ _compiled, inConstruct, notInConstruct, ...unsafe }) => ({
          ...unsafe,
          inConstruct: materializeConstructs(inConstruct),
          notInConstruct: materializeConstructs(notInConstruct),
        })
      )
    : settings.unsafe,
});

const isPluginTuple = (
  value: ConfiguredPluggable | Pluggable
): value is ConfiguredPluginTuple | PluginTuple => Array.isArray(value);

const materializePluggable = (
  value: ConfiguredPluggable | Pluggable
): Pluggable => {
  if (typeof value === 'function') return value;

  if (isPluginTuple(value)) {
    const [plugin, ...parameters] = value;

    return [plugin, ...parameters];
  }

  const preset: Preset = {
    ...(value.plugins
      ? { plugins: value.plugins.map(materializePluggable) }
      : {}),
    ...(value.settings
      ? { settings: materializeMarkdownSettings(value.settings) }
      : {}),
  };

  return preset;
};

export const materializeRemarkPlugins = (
  plugins: ReadonlyArray<ConfiguredPluggable | Pluggable>
): Pluggable[] => plugins.map(materializePluggable);

export const getRemarkPluginsWithoutMdx = (
  plugins: ReadonlyArray<ConfiguredPluggable | Pluggable>
) =>
  materializeRemarkPlugins(plugins).filter(
    (plugin) =>
      typeof plugin !== 'function' || pluginTags.get(plugin) !== REMARK_MDX_TAG
  );
