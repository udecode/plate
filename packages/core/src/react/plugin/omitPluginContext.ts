import type { AnyPlatePlugin, PlatePluginContext } from './PlatePlugin';

export const omitPluginContext = <T extends PlatePluginContext<AnyPlatePlugin>>(
  ctx: T
) => {
  const {
    api,
    editor,
    editorApi,
    getOption,
    getOptions,
    plugin,
    setOption,
    setOptions,
    type,
    ...rest
  } = ctx;

  void editorApi;

  return rest;
};
