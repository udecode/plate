import React from 'react';

import {
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from '@platejs/plite-react';
import {
  type TMediaElement,
  type TResizableElement,
  KEYS,
} from '@platejs/utils';
import { useEditor, useElement } from '@platejs/core/react';

import { VIDEO_PROVIDERS } from '../../lib/media-embed';
import {
  type EmbedUrlParser,
  parseMediaUrl,
} from '../../lib/media/parseMediaUrl';

export const useMediaState = ({
  urlParsers,
}: {
  urlParsers?: EmbedUrlParser[];
} = {}) => {
  const editor = useEditor();
  const element = useElement<TMediaElement & TResizableElement>();
  const focused = useEditorFocused();
  const selected = useElementSelected();
  const readOnly = useEditorReadOnly();

  const { id, align, isUpload, name, type, url } = element;

  const embed = React.useMemo(() => {
    if (
      !urlParsers ||
      (type !== editor.getType(KEYS.video) &&
        type !== editor.getType(KEYS.mediaEmbed))
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
