import type merge from 'lodash/merge.js';

import mergeWith from 'lodash/mergeWith.js';

export const mergeWithoutArray: typeof merge = (
  ...args: Parameters<typeof merge>
) => {
  return mergeWith(...args, (_: any, srcValue: any) => {
    if (Array.isArray(srcValue)) {
      return srcValue;
    }
  });
};
