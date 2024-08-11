import type { PlateEditor } from '@udecode/plate-core';

import { getPluginType } from '@udecode/plate-core';
import castArray from 'lodash/castArray.js';

/** Does the node match the type provided. */
export const isType = (
  editor: PlateEditor,
  node: any,
  key?: string | string[]
) => {
  const keys = castArray(key);
  const types: string[] = [];

  keys.forEach((_key) => types.push(getPluginType(editor, _key)));

  return types.includes(node?.type);
};
