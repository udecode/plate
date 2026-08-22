import type { PlatePluginContext } from './PlatePlugin';

export const omitPluginContext = <T extends PlatePluginContext>(ctx: T) => {
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
