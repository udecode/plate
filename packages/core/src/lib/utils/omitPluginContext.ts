import type { AnyPluginConfig, BasePluginContext } from '../plugin';

export const omitPluginContext = <T extends BasePluginContext<AnyPluginConfig>>(
  ctx: T
) => {
  const { api, editor, plugin, store, type, update, ...rest } = ctx;

  void update;

  return rest;
};
