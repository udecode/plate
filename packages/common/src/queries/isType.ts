import {
  getSlatePluginType,
  SlatePluginKey,
  SPEditor,
} from '@udecode/slate-plugins-core';

/**
 * Does the node match the type provided.
 */

export const isType = (
  editor: SPEditor,
  node: any,
  pluginKey?: SlatePluginKey
) => {
  return node?.type === getSlatePluginType(editor, pluginKey);
};
