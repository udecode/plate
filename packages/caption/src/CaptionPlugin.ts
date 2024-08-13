import { createPlugin } from '@udecode/plate-common';

import { onKeyDownCaption } from './onKeyDownCaption';
import { withCaption } from './withCaption';

export interface CaptionPluginOptions {
  /** Plugin keys to enable caption. */
  pluginKeys?: string[];
}

/** Enables support for caption. */
export const CaptionPlugin = createPlugin<'caption', CaptionPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownCaption,
  },
  key: 'caption',
  options: {
    pluginKeys: [],
  },
  withOverrides: withCaption,
});
