import { FunctionComponent } from 'react';
import { AnyObject } from '@udecode/slate';
import { castArray } from 'lodash';
import merge from 'lodash/merge';
import { createNodeHOC } from './createNodeHOC';

export type CreateHOCOptions<T> = Partial<T> &
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
  return (
    components: any,
    options: CreateHOCOptions<T> | CreateHOCOptions<T>[]
  ) => {
    const _components = { ...components };
    const optionsByKey = {};

    const optionsList = castArray<CreateHOCOptions<T>>(options);

    optionsList.forEach(({ key, keys, ...opt }) => {
      const _keys: string[] = key ? [key] : keys ?? Object.keys(_components);

      _keys.forEach((_key) => {
        optionsByKey[_key] = merge(optionsByKey[_key], opt);
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
