import { createPluginFactory } from '@udecode/plate-core';
import { getOnKeyDownCaption } from '../caption/getOnKeyDownCaption';
import { MediaPlugin } from '../media/index';
import { getIframeUrl } from './getIframeUrl';

export const ELEMENT_MEDIA_EMBED = 'media_embed';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const createMediaEmbedPlugin = createPluginFactory<MediaPlugin>({
  key: ELEMENT_MEDIA_EMBED,
  isElement: true,
  isVoid: true,
  handlers: {
    onKeyDown: getOnKeyDownCaption(ELEMENT_MEDIA_EMBED),
  },
  options: {
    transformUrl: getIframeUrl,
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'IFRAME',
        },
      ],
      getNode: (el: HTMLElement) => {
        const url = el.getAttribute('src');
        if (url) {
          return {
            type,
            url,
          };
        }
      },
    },
  }),
});
