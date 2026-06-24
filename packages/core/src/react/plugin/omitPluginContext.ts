import type { AnyPlatePlugin, PlatePluginContext } from './PlatePlugin';

export const omitPluginContext = <T extends PlatePluginContext<AnyPlatePlugin>>(
  ctx: T
): Omit<
  T,
  | 'api'
  | 'editor'
  | 'getOption'
  | 'getOptions'
  | 'plugin'
  | 'setOption'
  | 'setOptions'
  | 'type'
> => {
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

  return rest as Omit<
    T,
    | 'api'
    | 'editor'
    | 'getOption'
    | 'getOptions'
    | 'plugin'
    | 'setOption'
    | 'setOptions'
    | 'type'
  >;
};
