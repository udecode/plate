import type { AnySlatePlugin, SlatePluginContext } from '../plugin';

export const omitPluginContext = <T extends SlatePluginContext<AnySlatePlugin>>(
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
