import type { AnyPluginConfig, BasePluginContext } from '../plugin';

export const omitPluginContext = <T extends BasePluginContext<AnyPluginConfig>>(
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
