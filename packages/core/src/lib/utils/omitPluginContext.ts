import type { AnyPluginConfig, BasePluginContext } from '../plugin';

export const omitPluginContext = <T extends BasePluginContext<AnyPluginConfig>>(
  ctx: T
) => {
  const {
    api,
    editor,
    getOption,
    getOptions,
    plugin,
    setOption,
    setOptions,
    type,
    update,
    ...rest
  } = ctx;

  void update;

  return rest;
};
