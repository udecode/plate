import { getSlatePluginOptions } from '../utils/getSlatePluginOptions';
import { useTSlateStatic } from './useTSlateStatic';

/**
 * @see {@link getSlatePluginOptions}
 */
export const useSlatePluginOptions = (pluginKey: string) => {
  return getSlatePluginOptions(useTSlateStatic(), pluginKey);
};
