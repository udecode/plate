import { SlatePluginOptions } from './SlatePluginsOptions';

/**
 * Plugin options to get `onKeyDown` for marks.
 */
export type OnKeyDownMarkOptions = Pick<
  SlatePluginOptions,
  'type' | 'hotkey' | 'clear'
>;
