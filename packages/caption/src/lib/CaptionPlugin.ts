import {
  type PluginConfig,
  type TElement,
  type TPath,
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
    focusEndCaptionPath: TPath | null;
    focusStartCaptionPath: TPath | null;
    /** Plugin keys to enable caption. */
    pluginKeys?: string[];
    showCaptionId: null | string;
  }
>;

/** Enables support for caption. */
export const CaptionPlugin = createTSlatePlugin<CaptionConfig>({
  key: 'caption',
  options: {
    focusEndCaptionPath: null,
    focusStartCaptionPath: null,
    pluginKeys: [],
    showCaptionId: null,
  },
  withOverrides: withCaption,
});
