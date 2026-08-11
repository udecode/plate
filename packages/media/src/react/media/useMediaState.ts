import React from 'react';

import {
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from '@platejs/plite-react';
import { useEditor, useElement } from '@platejs/core/react';

import {
  type EmbedUrlParser,
  parseMediaUrl,
  VIDEO_PROVIDERS,
} from '../../lib/media/parseMediaUrl';
import { BaseVideoPlugin } from '../../lib/BaseMediaPlugin';
import { BaseMediaEmbedPlugin } from '../../lib/media-embed/BaseMediaEmbedPlugin';
import type { MediaPlugin } from '../plugins';

export const useMediaState = (
  plugin: MediaPlugin,
  { urlParsers }: { urlParsers?: EmbedUrlParser[] } = {}
) => {
  const editor = useEditor();
  const element = useElement(plugin);
  const focused = useEditorFocused();
  const selected = useElementSelected({ mode: 'node' });
  const readOnly = useEditorReadOnly();

  const { isUpload, name, type, url } = element;
  const elementTextAlign =
    'textAlign' in element ? element.textAlign : undefined;
  let textAlign: 'center' | 'left' | 'right' | undefined;

  if (elementTextAlign === 'center') textAlign = 'center';
  if (elementTextAlign === 'left') textAlign = 'left';
  if (elementTextAlign === 'right') textAlign = 'right';

  const embed = React.useMemo(() => {
    const video = editor.plugin(BaseVideoPlugin);
    const mediaEmbed = editor.plugin(BaseMediaEmbedPlugin);
    const supportedTypes = new Set<string>(
      [video, mediaEmbed]
        .filter((plugin) => plugin.installed)
        .map((plugin) => plugin.schema.type)
    );

    if (!urlParsers || !supportedTypes.has(type)) return;

    return parseMediaUrl(url, { urlParsers });
  }, [editor, type, url, urlParsers]);

  const isTweet = embed?.provider === 'twitter';
  const isVideo = !!embed?.provider && VIDEO_PROVIDERS.includes(embed.provider);
  const isYoutube = embed?.provider === 'youtube';

  return {
    embed,
    focused,
    isTweet,
    isUpload,
    isVideo,
    isYoutube,
    name,
    readOnly,
    selected,
    textAlign,
    unsafeUrl: url,
  };
};
