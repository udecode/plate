import { FunctionComponent } from 'react';
import { TRenderElementProps } from '@udecode/slate-plugins-core';

/**
 * Set HOC by plugin key.
 */
export const withHOC = <T,>(
  components: T,
  {
    hoc,
    pluginKeys,
  }: {
    /**
     * Return HOC.
     */
    hoc: (component: any, key: string) => any;

    /**
     * Apply HOC on these plugin keys.
     */
    pluginKeys?: string[];
  }
) => {
  const _components = { ...components };

  Object.keys(_components).forEach((key) => {
    if (!pluginKeys || pluginKeys.includes(key)) {
      _components[key] = hoc(_components[key], key);
    }
  });

  return _components;
};
