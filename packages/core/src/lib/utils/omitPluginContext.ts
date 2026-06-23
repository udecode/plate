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
