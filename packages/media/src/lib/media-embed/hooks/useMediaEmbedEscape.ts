import { useEditorPlugin, useHotkeys } from '@udecode/plate-common/react';

import { MediaEmbedPlugin } from '../../../react';

export const useMediaEmbedEscape = () => {
  const { api, useOption } = useEditorPlugin(MediaEmbedPlugin);

  const isOpen = useOption('isFloatingOpen');

  useHotkeys(
    'escape',
    () => {
      api.media_embed.hideFloating();
    },
    {
      enableOnFormTags: ['INPUT'],
      enabled: isOpen,
    },
    []
  );
};
