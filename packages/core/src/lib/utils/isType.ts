import castArray from 'lodash/castArray.js';

import type { BaseEditor } from '../editor';

/** Does the node match the type provided. */
export const isType = (
  editor: BaseEditor,
  node: any,
  key?: string[] | string
) => {
  const keys = castArray(key);
  const types: string[] = [];

  for (const _key of keys) {
    types.push(editor.getType(_key));
  }

  return types.includes(node?.type);
};
