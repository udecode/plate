import {
  type PluginConfig,
  createTSlatePlugin,
  isUrl,
} from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';

import type { MediaPluginOptions, TMediaElement } from '../media/index';

import { insertImage } from '../image';
import { parseIframeUrl } from './parseIframeUrl';

export interface TMediaEmbedElement extends TMediaElement {}

export type MediaEmbedApi = {
  hideFloating: () => void;
  openFloating: (mediaType: string) => void;
};

export type MediaEmbedConfig = PluginConfig<
  'media_embed',
  MediaPluginOptions,
  {
    media_embed: MediaEmbedApi;
  }
>;

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = createTSlatePlugin<MediaEmbedConfig>({
  key: 'media_embed',
  node: { isElement: true, isVoid: true },
  options: {
    isFloatingOpen: false,
    isUrl: isUrl,
    mediaType: null,
    transformUrl: parseIframeUrl,
    url: '',
  },
})
  .extendApi<Partial<MediaEmbedApi>>(({ editor, setOptions }) => ({
    hideFloating: () => {
      setOptions({ isFloatingOpen: false, url: '' });
      focusEditor(editor);
    },
    openFloating: (mediaType: string) => {
      focusEditor(editor);
      setOptions({ isFloatingOpen: true, mediaType });
    },
  }))
  .extendTransforms(({ api, editor, getOptions, setOptions }) => ({
    embed: (url: string) => {
      setOptions({ isFloatingOpen: false, url });

      const isUrl = getOptions().isUrl;

      if (!isUrl?.(url)) return;

      insertImage(editor, url);

      api.media_embed.hideFloating();
    },
  }))
  .extend(({ type }) => ({
    parsers: {
      html: {
        deserializer: {
          parse: ({ element }) => {
            const url = element.getAttribute('src');

            if (url) {
              return {
                type,
                url,
              };
            }
          },
          rules: [
            {
              validNodeName: 'IFRAME',
            },
          ],
        },
      },
    },
  }));
