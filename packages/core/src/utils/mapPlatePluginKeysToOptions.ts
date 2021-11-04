import { castArray } from 'lodash';
import { PlateEditor } from '../types/PlateEditor';
import { getPlatePluginOptions } from './getPlatePluginOptions';

/**
 * Map plugins keys to SP options
 */
export const mapPlatePluginKeysToOptions = <T = {}>(
  editor: PlateEditor<T>,
  pluginKey: string | string[]
) => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getPlatePluginOptions<{}, T>(editor, key));
};
