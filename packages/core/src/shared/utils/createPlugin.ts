import merge from 'lodash/merge';

import type { PlatePlugin } from '../types';

import { isFunction } from './misc/isFunction';

export function createPlugin<O = {}, T = {}, Q = {}, S = {}>(
  config: Partial<PlatePlugin<O, T, Q, S>>
): PlatePlugin<O, T, Q, S> {
  const key = config.key ?? 'unnamed';
  const options = config.options ?? ({} as O);
  const queries = config.queries ?? ({} as Q);
  const transforms = config.transforms ?? ({} as T);

  const plugin = merge(
    {},
    {
      editor: {},
      inject: {},
      key,
      options,
      queries,
      transforms,
      type: key,
    },
    config
  ) as PlatePlugin<O, T, Q, S>;

  plugin.configure = (opt) => createPlugin(merge({}, plugin, { options: opt }));

  plugin.extend = (extendConfig) => {
    const newPlugin = { ...plugin };

    if (isFunction(extendConfig)) {
      const oldExtend = newPlugin.__extend;
      newPlugin.__extend = (editor, p) => {
        let result = p;

        if (oldExtend) {
          result = oldExtend(editor, result) as any;
        }

        return extendConfig(editor, result) as any;
      };
    } else {
      newPlugin.__extend = (editor, p) => {
        let result = p;

        if (newPlugin.__extend) {
          result = newPlugin.__extend(editor, result) as any;
        }

        return merge({}, result, extendConfig) as any;
      };
    }

    return newPlugin as any;
  };

  // TODO: pass plugin instead for types
  plugin.extendPlugin = (key, extendConfig) => {
    const originalPlugins = plugin.plugins ?? [];

    const plugins = originalPlugins.map((p) => {
      if (p.key === key) {
        return isFunction(extendConfig)
          ? ({
              ...p,
              __extend: extendConfig,
            } as any)
          : merge({}, p, extendConfig);
      }

      return p;
    });

    return {
      ...plugin,
      plugins,
    };
  };

  return plugin;
}

const a = createPlugin({
  options: { a: 1 },
});

const b = a.extend((editor, plugin) => ({
  options: { b: 2 },
}));
const c = a.extend({
  options: { c: 2 },
});

// b.configure({});
