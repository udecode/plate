import { useMemo } from 'react';
import { useElement } from '@udecode/plate-common';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import { VIDEO_PROVIDERS } from '../media-embed';
import { TMediaElement } from './types';

export type EmbedUrlData = {
  url?: string;
  provider?: string;
  id?: string;
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

  const { url } = element;

  const embed = useMemo(() => {
    if (!urlParsers) return;

    for (const parser of urlParsers) {
      const data = parser(url);
      if (data) {
        return data;
      }
    }
  }, [urlParsers, url]);

  const isTweet = embed?.provider === 'twitter';
  const isVideo = !!embed?.provider && VIDEO_PROVIDERS.includes(embed.provider);

  return {
    focused,
    selected,
    readOnly,
    embed,
    isTweet,
    isVideo,
  };
};
