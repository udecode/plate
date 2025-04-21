import type { Plugin } from 'unified';

export const REMARK_MDX_TAG = 'remarkMdx';

export const tagRemarkPlugin = (pluginFn: any, tag: string) => {
  const wrapped = function (this: any, ...args: any[]) {
    return pluginFn.apply(this, args);
  };
  wrapped.__pluginTag = tag;
  return wrapped;
};

export const getRemarkPluginsWithoutMdx = (plugins: Plugin[]) => {
  return plugins.filter((plugin) => {
    return (plugin as any).__pluginTag !== REMARK_MDX_TAG;
  });
};
