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
  plugins.filter(
    (plugin) =>
      plugin !== baseRemarkMdx &&
      !('__pluginTag' in plugin && plugin.__pluginTag === REMARK_MDX_TAG)
  );
