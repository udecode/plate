import { SlatePluginOptions } from './SlatePluginsOptions';

/**
 * Plugin options to get `onKeyDown` for elements.
 */
export type OnKeyDownElementOptions = Pick<
  SlatePluginOptions,
  'type' | 'defaultType' | 'hotkey'
>;
