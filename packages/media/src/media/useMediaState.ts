import React from 'react';

import { useElement } from '@udecode/plate-common';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TMediaElement } from './types';
import { ELEMENT_VIDEO } from '../video';
import { VIDEO_PROVIDERS, ELEMENT_MEDIA_EMBED} from '../media-embed';

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

  const { align = 'left', id, isUpload, name, type, url } = element;

  const embed = React.useMemo(() => {
    if (!urlParsers || (type !== ELEMENT_VIDEO && type !== ELEMENT_MEDIA_EMBED)) return;

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
