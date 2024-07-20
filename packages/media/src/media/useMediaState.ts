import React from 'react';

import { useElement } from '@udecode/plate-common';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TMediaElement } from './types';

import { ELEMENT_MEDIA_EMBED, VIDEO_PROVIDERS } from '../media-embed';
import { ELEMENT_VIDEO } from '../video';

export type EmbedUrlData = {
  id?: string;
  provider?: string;
  url?: string;
};

export type EmbedUrlParser = (url: string) => EmbedUrlData | undefined;

// Unlike the link plugin, there's no legitimate reason for non-HTTP source URLs
const allowedProtocols = new Set(['https:', 'http:']);

export const parseMediaUrl = (
  url: string,
  {
    urlParsers,
  }: {
    urlParsers: EmbedUrlParser[];
  }
): EmbedUrlData | undefined => {
  const embed = (() => {
    for (const parser of urlParsers) {
      const data = parser(url);

      if (data) {
        return data;
      }
    }
  })();

  // Harden against XSS
  if (embed?.url) {
    try {
      const { protocol } = new URL(embed.url);

      if (!allowedProtocols.has(protocol)) {
        return undefined;
      }
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Could not parse URL: ' + embed.url);

      return undefined;
    }
  }

  return embed;
};

export const useMediaState = ({
  urlParsers,
}: {
  urlParsers?: EmbedUrlParser[];
} = {}) => {
  const element = useElement<TMediaElement>();
  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const { align, id, isUpload, name, type, url } = element;

  const embed = React.useMemo(() => {
    if (!urlParsers || (type !== ELEMENT_VIDEO && type !== ELEMENT_MEDIA_EMBED))
      return;

    return parseMediaUrl(url, { urlParsers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParsers, url]);

  const isTweet = embed?.provider === 'twitter';
  const isVideo = !!embed?.provider && VIDEO_PROVIDERS.includes(embed.provider);
  const isYoutube = embed?.provider === 'youtube';

  return {
    align,
    embed,
    focused,
    id,
    isTweet,
    isUpload,
    isVideo,
    isYoutube,
    name,
    readOnly,
    selected,
    unsafeUrl: url,
  };
};
