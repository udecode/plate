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
  | 'tf'
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
    tf: _tf,
    type,
    ...rest
  } = ctx as T & { tf?: unknown };

  return rest as Omit<
    T,
    | 'api'
    | 'editor'
    | 'getOption'
    | 'getOptions'
    | 'plugin'
    | 'setOption'
    | 'setOptions'
    | 'tf'
    | 'type'
  >;
};
