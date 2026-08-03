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
  NODES,
} from '@platejs/utils';
import { useEditor, useElement } from '@platejs/core/react';

import {
  type EmbedUrlParser,
  parseMediaUrl,
  VIDEO_PROVIDERS,
} from '../../lib/media/parseMediaUrl';

export const useMediaState = ({
  urlParsers,
}: {
  urlParsers?: EmbedUrlParser[];
} = {}) => {
  const editor = useEditor();
  const element = useElement<TMediaElement & TResizableElement>();
  const focused = useEditorFocused();
  const selected = useElementSelected({ mode: 'node' });
  const readOnly = useEditorReadOnly();

  const { id, align, isUpload, name, type, url } = element;

  const embed = React.useMemo(() => {
    const video = editor.plugin(KEYS.video);
    const mediaEmbed = editor.plugin(KEYS.mediaEmbed);

    if (
      !urlParsers ||
      (type !== (video.installed ? video.type : NODES.video) &&
        type !== (mediaEmbed.installed ? mediaEmbed.type : NODES.mediaEmbed))
    )
      return;

    return parseMediaUrl(url, { urlParsers });
  }, [editor, type, url, urlParsers]);

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
