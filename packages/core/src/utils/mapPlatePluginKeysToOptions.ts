import { castArray } from 'lodash';
import { SPEditor } from '../types/SPEditor';
import { getPlatePluginOptions } from './getPlatePluginOptions';

/**
 * Map plugins keys to SP options
 */
export const mapPlatePluginKeysToOptions = (
  editor: SPEditor,
  pluginKey: string | string[]
) => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getPlatePluginOptions(editor, key));
};
