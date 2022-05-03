import { FunctionComponent } from 'react';
import { castArray } from 'lodash';
import { AnyObject } from '../types/utility/AnyObject';
import { createNodeHOC } from './createNodeHOC';

export type Options<T> = Partial<T> &
  AnyObject & {
    /**
     * Set HOC by key.
     */
    key?: string;

    /**
     * Set HOC by key.
     */
    keys?: string[];
  };

const createHOC = <T,>(withHOC: any) => {
  return (components: any, options: Options<T> | Options<T>[]) => {
    const _components = { ...components };
    const optionsByKey = {};

    const optionsList = castArray<Options<T>>(options);

    optionsList.forEach(({ key, keys, ...opt }) => {
      const _keys: string[] = key ? [key] : keys ?? Object.keys(_components);

      _keys.forEach((_key) => {
        optionsByKey[_key] = { ...optionsByKey[_key], ...opt };
      });
    });

    Object.keys(optionsByKey).forEach((key) => {
      if (!_components[key]) return;

      _components[key] = withHOC(_components[key], optionsByKey[key]);
    });

    return _components;
  };
};

/**
 * Create components HOC by plugin key.
 */
export const createNodesHOC = <T,>(HOC: FunctionComponent<T>) => {
  return createHOC<T>(createNodeHOC(HOC));
};

/**
 * Create components HOC by plugin key with a custom HOC.
 */
export const createNodesWithHOC = <T,>(
  withHOC: (component: any, props: T) => any
) => {
  return createHOC<T>(withHOC);
};
