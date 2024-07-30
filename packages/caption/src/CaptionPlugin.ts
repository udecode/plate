import { createPlugin } from '@udecode/plate-common/server';

import { onKeyDownCaption } from './onKeyDownCaption';
import { withCaption } from './withCaption';

export interface CaptionPluginOptions {
  /** Plugin keys to enable caption. */
  pluginKeys?: string[];
}

export const KEY_CAPTION = 'caption';

/** Enables support for caption. */
export const CaptionPlugin = createPlugin<CaptionPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownCaption,
  },
  key: KEY_CAPTION,
  options: {
    pluginKeys: [],
  },
  withOverrides: withCaption,
});
