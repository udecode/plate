import type { AnyPlatePlugin, PlatePluginContext } from './PlatePlugin';

export const omitPluginContext = <T extends PlatePluginContext<AnyPlatePlugin>>(
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
    tf,
    type,
    ...rest
  } = ctx;

  return rest;
};
