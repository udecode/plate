import castArray from 'lodash/castArray.js';

/** Does the node match the type provided. */
export const isType = (
  editor: { getType: (pluginKey: string) => string },
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
