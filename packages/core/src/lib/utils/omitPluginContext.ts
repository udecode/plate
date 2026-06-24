import type { AnyEditorPlugin, EditorPluginContext } from '../plugin';

export const omitPluginContext = <
  T extends EditorPluginContext<AnyEditorPlugin>,
>(
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
