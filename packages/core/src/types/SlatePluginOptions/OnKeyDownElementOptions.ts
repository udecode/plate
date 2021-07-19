import { PlatePluginOptions } from './PlateOptions';

/**
 * Plugin options to get `onKeyDown` for elements.
 */
export type OnKeyDownElementOptions = Pick<
  PlatePluginOptions,
  'type' | 'defaultType' | 'hotkey'
>;
