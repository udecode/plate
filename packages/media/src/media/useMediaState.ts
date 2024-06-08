import React from 'react';

import { useElement } from '@udecode/plate-common';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TMediaElement } from './types';

import { VIDEO_PROVIDERS } from '../media-embed';

export type EmbedUrlData = {
  id?: string;
  provider?: string;
  url?: string;
};

export type EmbedUrlParser = (url: string) => EmbedUrlData | undefined;

export const useMediaState = ({
  urlParsers,
}: {
  urlParsers?: EmbedUrlParser[];
} = {}) => {
  const element = useElement<TMediaElement>();
  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const { align = 'left', id, isUpload, name, url } = element;

  const embed = React.useMemo(() => {
    if (!urlParsers) return;

    for (const parser of urlParsers) {
      const data = parser(url);

      if (data) {
        return data;
      }
    }
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
    url,
  };
};
