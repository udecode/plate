import { DeserializeHtml } from '../../common';
import { MEDIA_EMBED, MediaEmbedDeserializeOptions } from './types';

export const deserializeIframe = ({
  typeMediaEmbed = MEDIA_EMBED,
}: MediaEmbedDeserializeOptions = {}): DeserializeHtml => {
  const createElement = (el: HTMLElement) => {
    let url = el.getAttribute('src');
    if (url) {
      [url] = url.split('?');

      return {
        type: typeMediaEmbed,
        url,
      };
    }
  };

  return {
    element: {
      IFRAME: createElement,
    },
  };
};
