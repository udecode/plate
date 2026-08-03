import type { AnyBasePluginDefinition, BasePluginContext } from '../plugin';

export const omitPluginContext = <
  T extends BasePluginContext<AnyBasePluginDefinition>,
>(
  ctx: T
) => {
  const {
    api,
    defineCodecs,
    editor,
    installed,
    name,
    plugin,
    read,
    store,
    update,
    ...rest
  } = ctx;

  return rest;
};
