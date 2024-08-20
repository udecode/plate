import {
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { withCaption } from './withCaption';

export interface TCalloutElement extends TElement {
  backgroundColor?: string;
  color?: string;
  icon?: string;
  variant?: 'info' | 'note' | 'tip' | 'warning';
}

export type CaptionConfig = PluginConfig<
  'caption',
  {
    /** Plugin keys to enable caption. */
    pluginKeys?: string[];
  }
>;

/** Enables support for caption. */
export const CaptionPlugin = createTSlatePlugin<CaptionConfig>({
  key: 'caption',
  options: {
    pluginKeys: [],
  },
  withOverrides: withCaption,
});
