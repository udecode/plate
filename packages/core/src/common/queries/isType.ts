import castArray from 'lodash/castArray';
import { PlateEditor } from '../../types/PlateEditor';
import { getPluginType } from '../../utils/getPluginType';

/**
 * Does the node match the type provided.
 */
export const isType = (
  editor: PlateEditor,
  node: any,
  key?: string | string[]
) => {
  const keys = castArray(key);
  keys.forEach((_key) => {
    if (node?.type === getPluginType(editor, _key)) return true;
  });
  return false;
};
