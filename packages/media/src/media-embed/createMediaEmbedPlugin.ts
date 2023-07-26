import { createPluginFactory } from '@udecode/plate-common';

import { getOnKeyDownCaption } from '../caption/getOnKeyDownCaption';
import { getWithSelectionCaption } from '../caption/getWithSelectionCaption';
import { MediaPlugin } from '../media/index';
import { parseIframeUrl } from './parseIframeUrl';

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
  withOverrides: (editor, plugin) => {
    const {
      options: { disableCaption },
    } = plugin;

    if (!disableCaption) {
      editor = getWithSelectionCaption(ELEMENT_MEDIA_EMBED)(editor, plugin);
    }

    return editor;
  },
  options: {
    transformUrl: parseIframeUrl,
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
