import type { Pluggable } from 'unified';

export const REMARK_MDX_TAG = 'remarkMdx';

type Callable = (...args: never[]) => unknown;
type TaggedPlugin = { __pluginTag?: string };

export const tagRemarkPlugin = <T extends Callable>(
  pluginFn: T,
  tag: string
) => {
  const wrapped = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    return pluginFn.apply(this, args);
  } as T & TaggedPlugin;

  wrapped.__pluginTag = tag;

  return wrapped;
};

export const getRemarkPluginsWithoutMdx = (plugins: Pluggable[]) =>
  plugins.filter(
    (plugin) =>
      typeof plugin !== 'function' ||
      (plugin as TaggedPlugin).__pluginTag !== REMARK_MDX_TAG
  );
