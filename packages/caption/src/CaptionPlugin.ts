import { type PluginConfig, createTPlugin } from '@udecode/plate-common';

import { onKeyDownCaption } from './onKeyDownCaption';
import { withCaption } from './withCaption';

export type CaptionConfig = PluginConfig<
  'caption',
  {
    /** Plugin keys to enable caption. */
    pluginKeys?: string[];
  }
>;

/** Enables support for caption. */
export const CaptionPlugin = createTPlugin<CaptionConfig>({
  handlers: {
    onKeyDown: onKeyDownCaption,
  },
  key: 'caption',
  options: {
    pluginKeys: [],
  },
  withOverrides: withCaption,
});
