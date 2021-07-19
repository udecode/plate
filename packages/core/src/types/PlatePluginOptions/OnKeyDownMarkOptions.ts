import { PlatePluginOptions } from './PlateOptions';

/**
 * Plugin options to get `onKeyDown` for marks.
 */
export type OnKeyDownMarkOptions = Pick<
  PlatePluginOptions,
  'type' | 'hotkey' | 'clear'
>;
