import mergeWith from 'lodash/mergeWith.js';

import type { SlatePlugin } from '../lib';

export function mergePlugins<T>(basePlugin: T, ...sourcePlugins: any[]): T {
  return mergeWith(
    {},
    basePlugin,
    ...sourcePlugins,
    (objValue: unknown, srcValue: unknown, key: keyof SlatePlugin) => {
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
