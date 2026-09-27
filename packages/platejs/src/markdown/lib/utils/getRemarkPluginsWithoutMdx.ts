import type { Pluggable, Plugin, Settings } from 'unified';

import type { NormalizePluginState } from '../../../lib/plugin/PluginDefinition';
import { MarkdownPluginConfigurationError } from '../internal/markdownDiagnostics';
import type {
  MarkdownSyncPluggable,
  MarkdownSyncPlugin,
  MarkdownSyncTransformer,
} from '../types';

export const REMARK_MDX_TAG = 'remarkMdx';
export const REMARK_PARSE_ONLY_TAG = 'parseOnly';

type Callable = (...args: never[]) => unknown;
const pluginTags = new WeakMap<object, string>();

export const tagRemarkPlugin = <T extends Callable>(
  pluginFn: T,
  tag: string
) => {
  pluginTags.set(pluginFn, tag);

  return pluginFn;
};

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

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, 'then') === 'function';

type MarkdownPluginBoundary = (
  this: Parameters<MarkdownSyncPlugin['apply']>[0],
  ...parameters: unknown[]
) => MarkdownSyncTransformer | void;

type MarkdownTransformerBoundary = (
  tree: Parameters<MarkdownSyncTransformer>[0],
  file: Parameters<MarkdownSyncTransformer>[1]
) => ReturnType<MarkdownSyncTransformer>;

const wrapSyncPlugin = (plugin: MarkdownSyncPlugin, index: number): Plugin =>
  function syncPlugin(...parameters: unknown[]) {
    const transformer = (plugin as MarkdownPluginBoundary).apply(
      this,
      parameters
    );

    if (isThenable(transformer)) {
      throw new MarkdownPluginConfigurationError(
        `Markdown remark plugin at index ${index} returned a thenable attacher result.`
      );
    }
    if (transformer === undefined) return undefined;
    if (typeof transformer !== 'function') {
      throw new MarkdownPluginConfigurationError(
        `Markdown remark plugin at index ${index} must return a synchronous transformer or undefined.`
      );
    }
    if (transformer.length >= 3) {
      throw new MarkdownPluginConfigurationError(
        `Markdown remark plugin at index ${index} returned a callback-style transformer. Only synchronous transformers are supported.`
      );
    }

    return (tree, file) => {
      const result = (transformer as MarkdownTransformerBoundary)(
        tree as Parameters<MarkdownSyncTransformer>[0],
        file
      );

      if (isThenable(result)) {
        throw new MarkdownPluginConfigurationError(
          `Markdown remark plugin at index ${index} returned a thenable transformer result.`
        );
      }

      return result;
    };
  } as Plugin;

const getPlugin = (pluggable: MarkdownSyncPluggable) =>
  Array.isArray(pluggable) ? pluggable[0] : pluggable;

const materializePluggable = (
  value: MarkdownSyncPluggable,
  index: number
): Pluggable => {
  if (typeof value === 'function') return wrapSyncPlugin(value, index);
  if (!Array.isArray(value) || typeof value[0] !== 'function') {
    throw new MarkdownPluginConfigurationError(
      `Markdown remark plugin at index ${index} must be a function or plugin tuple.`
    );
  }
  const [plugin, ...parameters] = value;

  return [wrapSyncPlugin(plugin, index), ...parameters] as Pluggable;
};

export const materializeRemarkPlugins = (
  plugins: readonly MarkdownSyncPluggable[]
): Pluggable[] =>
  plugins.map((plugin, index) => materializePluggable(plugin, index));

export const getRemarkPluginsWithoutMdx = (
  plugins: readonly MarkdownSyncPluggable[]
) =>
  materializeRemarkPlugins(
    plugins.filter(
      (plugin) => pluginTags.get(getPlugin(plugin)) !== REMARK_MDX_TAG
    )
  );

export const getRemarkPluginsForSerialize = (
  plugins: readonly MarkdownSyncPluggable[]
) =>
  materializeRemarkPlugins(
    plugins.filter(
      (plugin) => pluginTags.get(getPlugin(plugin)) !== REMARK_PARSE_ONLY_TAG
    )
  );
