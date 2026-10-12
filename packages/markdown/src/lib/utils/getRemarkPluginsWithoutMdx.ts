import type { Plugin } from 'unified';

import baseRemarkMdx from 'remark-mdx';

export const REMARK_MDX_TAG = 'remarkMdx';

export const tagRemarkPlugin = (pluginFn: any, tag: string) => {
  const wrapped = function (this: any, ...args: any[]) {
    return pluginFn.apply(this, args);
  };
  wrapped.__pluginTag = tag;
  return wrapped;
};

export const getRemarkPluginsWithoutMdx = (plugins: Plugin[]) =>
  plugins.filter((plugin) => (plugin as any).__pluginTag !== REMARK_MDX_TAG);

/** Whether the plugins include remark-mdx, either Plate's tagged wrapper or the plain plugin */
export const hasRemarkMdx = (plugins: Plugin[] | undefined) =>
  !!plugins?.some(
    (plugin) =>
      (plugin as any).__pluginTag === REMARK_MDX_TAG ||
      plugin === (baseRemarkMdx as unknown as Plugin)
  );
