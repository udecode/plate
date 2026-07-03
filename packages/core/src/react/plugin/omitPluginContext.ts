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
    type,
    ...rest
  } = ctx;

  return rest;
};
