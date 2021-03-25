import { getSlatePluginType } from '../utils/getSlatePluginType';
import { useTSlateStatic } from './useTSlateStatic';

/**
 * @see {@link getSlatePluginType}
 */
export const useSlatePluginType = (pluginKey: string) => {
  return getSlatePluginType(useTSlateStatic(), pluginKey);
};
