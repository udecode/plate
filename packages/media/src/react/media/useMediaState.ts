import React from 'react';

import { useEditorRef, useElement } from '@udecode/plate-common/react';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TMediaElement } from '../../lib/media/types';

import { BaseVideoPlugin } from '../../lib';
import {
  type EmbedUrlParser,
  parseMediaUrl,
} from '../../lib/media/parseMediaUrl';
import { BaseMediaEmbedPlugin, VIDEO_PROVIDERS } from '../../lib/media-embed';

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

  const { id, align, isUpload, name, type, url } = element;

  const embed = React.useMemo(() => {
    if (
      !urlParsers ||
      (type !== editor.getType(BaseVideoPlugin) &&
        type !== editor.getType(BaseMediaEmbedPlugin))
    )
      return;

    return parseMediaUrl(url, { urlParsers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParsers, url]);

  const isTweet = embed?.provider === 'twitter';
  const isVideo = !!embed?.provider && VIDEO_PROVIDERS.includes(embed.provider);
  const isYoutube = embed?.provider === 'youtube';

  return {
    id,
    align,
    embed,
    focused,
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
