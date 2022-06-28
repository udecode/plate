import castArray from 'lodash/castArray';
import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/plate/PlateEditor';
import { getPluginType } from '../utils/plate/getPluginType';

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
