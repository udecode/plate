import {
  type PluginConfig,
  type TPath,
  type WithRequiredKey,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { withCaption } from './withCaption';

export type CaptionConfig = PluginConfig<
  'caption',
  {
    /** When defined, focus end of caption textarea with the same path. */
    focusEndPath: TPath | null;
    /** When defined, focus start of caption textarea with the same path. */
    focusStartPath: TPath | null;
    // isVisible?: (elementId: string) => boolean;
    /** Plugins to enable caption. */
    plugins: WithRequiredKey[];

    visibleId: string | null;
  } & CaptionSelectors
>;

type CaptionSelectors = {
  isVisible?: (elementId: string) => boolean;
};

/** Enables support for caption. */
export const BaseCaptionPlugin = createTSlatePlugin<CaptionConfig>({
  key: 'caption',
  extendEditor: withCaption,
  options: {
    focusEndPath: null,
    focusStartPath: null,
    plugins: [],
    visibleId: null,
  },
}).extendOptions<CaptionSelectors>(({ getOptions }) => ({
  isVisible: (elementId) => getOptions().visibleId === elementId,
}));
