import { useEditorPlugin, useHotkeys } from '@udecode/plate-common/react';

import { MediaEmbedPlugin } from '../../../react';

export const useMediaEmbedEnter = () => {
  const { tf, useOption } = useEditorPlugin(MediaEmbedPlugin);

  const isOpen = useOption('isOpen');
  const url = useOption('url');

  useHotkeys(
    'enter',
    () => {
      tf.media_embed.embed(url!);
    },
    {
      enableOnFormTags: ['INPUT'],
      enabled: isOpen,
    },
    [url]
  );
};
