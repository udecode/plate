import { createPluginFactory } from '@udecode/plate-common/server';

import { onKeyDownCaption } from './onKeyDownCaption';
import { withCaption } from './withCaption';

export interface CaptionPlugin {
  /**
   * Plugin keys to enable caption.
   */
  pluginKeys?: string[];
}

export const KEY_CAPTION = 'caption';

/**
 * Enables support for caption.
 */
export const createCaptionPlugin = createPluginFactory<CaptionPlugin>({
  key: KEY_CAPTION,
  withOverrides: withCaption,
  handlers: {
    onKeyDown: onKeyDownCaption,
  },
  options: {
    pluginKeys: [],
  },
});
