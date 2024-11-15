import type { ExtendConfig } from '@udecode/plate-common';

import { focusEditor, toTPlatePlugin } from '@udecode/plate-common/react';

import {
  type BaseMediaEmbedConfig,
  BaseMediaEmbedPlugin,
  insertImage,
} from '../../lib';

type MediaEmbedConfig = ExtendConfig<
  BaseMediaEmbedConfig,
  {
    isFloatingOpen?: boolean;
    mediaType?: string | null;
    url?: string;
  }
>;

export const MediaEmbedPlugin = toTPlatePlugin<MediaEmbedConfig>(
  BaseMediaEmbedPlugin,
  {
    options: {
      isFloatingOpen: false,
      mediaType: null,
      url: '',
    },
  }
).extendTransforms(({ editor, getOptions, setOptions }) => ({
  embed: (url: string) => {
    setOptions({ isFloatingOpen: false, url });

    const isUrl = getOptions().isUrl;

    if (!isUrl?.(url)) return;

    insertImage(editor, url);

    focusEditor(editor);
  },
}));
