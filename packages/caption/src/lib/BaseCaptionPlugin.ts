import {
  type Path,
  type PluginConfig,
  type SlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

export type CaptionConfig = PluginConfig<
  'caption',
  {
    /** When defined, focus end of caption textarea with the same path. */
    focusEndPath: Path | null;
    /** When defined, focus start of caption textarea with the same path. */
    focusStartPath: Path | null;
    // isVisible?: (elementId: string) => boolean;
    query: {
      /** Plugin keys to enable caption. */
      allow: string[];
    };
    visibleId: string | null;
  },
  {},
  {},
  {
    isVisible?: (elementId: string) => boolean;
  }
>;

/** Enables support for caption. */
const BaseCaptionPluginBase: SlatePlugin<CaptionConfig> =
  createTSlatePlugin<CaptionConfig>({
    key: KEYS.caption,
    options: {
      focusEndPath: null,
      focusStartPath: null,
      query: { allow: [] },
      visibleId: null,
    },
  }).extendSelectors<CaptionConfig['selectors']>(({ getOptions }) => ({
    isVisible: (elementId) => getOptions().visibleId === elementId,
  }));

export const BaseCaptionPlugin: SlatePlugin<CaptionConfig> & {
  runtimeCaption: boolean;
} = Object.assign(BaseCaptionPluginBase, {
  runtimeCaption: true,
});
