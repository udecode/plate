import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import { onKeyDownCaption } from '../react/onKeyDownCaption';
import { withCaption } from './withCaption';

export type CaptionConfig = PluginConfig<
  'caption',
  {
    /** Plugin keys to enable caption. */
    pluginKeys?: string[];
  }
>;

/** Enables support for caption. */
export const CaptionPlugin = createTSlatePlugin<CaptionConfig>({
  handlers: {
    onKeyDown: onKeyDownCaption,
  },
  key: 'caption',
  options: {
    pluginKeys: [],
  },
  withOverrides: withCaption,
});
