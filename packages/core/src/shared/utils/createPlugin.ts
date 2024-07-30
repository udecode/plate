import merge from 'lodash/merge';

import type { PlatePlugin } from '../types';

import { isFunction } from './misc';

export function createPlugin<O = {}, T = {}, Q = {}, S = {}>(
  config: Partial<PlatePlugin<O, T, Q, S>>
): PlatePlugin<O, T, Q, S> {
  const key = config.key ?? 'unnamed';

  const plugin = merge(
    {},
    {
      __extensions: [],
      editor: {},
      inject: {},
      key,
      options: {},
      plugins: [],
      queries: {},
      transforms: {},
      type: key,
    },
    config
  ) as PlatePlugin<O, T, Q, S>;

  plugin.configure = (opt) => createPlugin(merge({}, plugin, { options: opt }));

  plugin.extend = (extendConfig) => {
    const newPlugin = { ...plugin };
    newPlugin.__extensions = [
      ...(newPlugin.__extensions as any),
      (editor, p) =>
        isFunction(extendConfig) ? extendConfig(editor, p) : extendConfig,
    ];

    return newPlugin as any;
  };

  plugin.extendPlugin = (key, extendConfig) => {
    const newPlugin = { ...plugin };
    newPlugin.__extensions = [
      ...(newPlugin.__extensions as any),
      (_, p) => ({
        ...p,
        plugins: p.plugins?.map((nestedPlugin) =>
          nestedPlugin.key === key
            ? nestedPlugin.extend(extendConfig)
            : nestedPlugin
        ),
      }),
    ];

    return newPlugin;
  };

  return plugin;
}
