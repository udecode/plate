import { castArray } from 'lodash';
import { SPEditor } from '../types/SPEditor';
import { getSlatePluginOptions } from './getSlatePluginOptions';

/**
 * Map plugins keys to SP options
 */
export const mapSlatePluginKeysToOptions = (
  editor: SPEditor,
  pluginKey: string | string[]
) => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getSlatePluginOptions(editor, key));
};
