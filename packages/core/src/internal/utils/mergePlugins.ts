import mergeWith from 'lodash/mergeWith.js';

import type { BasePlugin } from '../../lib';

export function mergePlugins<T>(basePlugin: T, ...sourcePlugins: any[]): T {
  return mergeWith(
    {},
    basePlugin,
    ...sourcePlugins,
    (objValue: unknown, srcValue: unknown, key: keyof BasePlugin) => {
      // Overwrite array (including plugins) without cloning
      if (Array.isArray(srcValue)) {
        return srcValue;
      }
      // Shallow merge options
      if (key === 'options') {
        return { ...(objValue as any), ...(srcValue as any) };
      }
    }
  );
}
