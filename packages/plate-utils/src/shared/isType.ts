import { getPluginType } from '@udecode/plate-core/server';
import { Value } from '@udecode/slate';
import castArray from 'lodash/castArray.js';

import type { PlateEditor } from '@udecode/plate-core/server';

/**
 * Does the node match the type provided.
 */
export const isType = <V extends Value>(
  editor: PlateEditor<V>,
  node: any,
  key?: string | string[]
) => {
  const keys = castArray(key);
  const types: string[] = [];

  keys.forEach((_key) => types.push(getPluginType(editor, _key)));

  return types.includes(node?.type);
};
