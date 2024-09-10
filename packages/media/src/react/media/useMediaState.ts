import React from 'react';

import { useEditorRef, useElement } from '@udecode/plate-common/react';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TMediaElement } from '../../lib/media/types';

import { VideoPlugin } from '../../lib';
import {
  type EmbedUrlParser,
  parseMediaUrl,
} from '../../lib/media/parseMediaUrl';
import { MediaEmbedPlugin, VIDEO_PROVIDERS } from '../../lib/media-embed';

export const useMediaState = ({
  urlParsers,
}: {
  urlParsers?: EmbedUrlParser[];
} = {}) => {
  const editor = useEditorRef();
  const element = useElement<TMediaElement>();
  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const { align, id, isUpload, name, type, url } = element;

  const embed = React.useMemo(() => {
    if (
      !urlParsers ||
      (type !== editor.getType(VideoPlugin) &&
        type !== editor.getType(MediaEmbedPlugin))
    )
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
