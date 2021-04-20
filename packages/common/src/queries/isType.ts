import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import castArray from 'lodash/castArray';
/**
 * Does the node match the type provided.
 */

export const isType = (
  editor: SPEditor,
  node: any,
  pluginKey?: string | string[]
) => {
  const keys = castArray(pluginKey);
  keys.forEach((key) => {
    if (node?.type === getSlatePluginType(editor, key)) return true;
  });
  return false;
};
