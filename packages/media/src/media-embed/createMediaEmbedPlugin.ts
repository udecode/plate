import { createPluginFactory } from '@udecode/plate-common';
import { getOnKeyDownCaption } from '../caption/getOnKeyDownCaption';
import { getWithSelectionCaption } from '../caption/getWithSelectionCaption';
import { MediaPlugin } from '../media/index';
import { MediaEmbedTweet, parseTwitterUrl } from '../twitter/index';
import { MediaEmbedVideo, parseVideoUrl } from '../video/index';
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
  dangerouslyAllowAttributes: ['width', 'height'],
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
    rules: [
      {
        parser: parseTwitterUrl,
        component: MediaEmbedTweet,
      },
      {
        parser: parseVideoUrl,
        component: MediaEmbedVideo,
      },
    ],
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
