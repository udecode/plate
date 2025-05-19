'use client';

import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import { createPlatePlugins } from '@udecode/plate/react';

export const DeleteKit = createPlatePlugins([
  SelectOnBackspacePlugin.configure({
    options: {
      query: {
        allow: [
          ImagePlugin.key,
          VideoPlugin.key,
          AudioPlugin.key,
          FilePlugin.key,
          MediaEmbedPlugin.key,
          HorizontalRulePlugin.key,
        ],
      },
    },
  }),
  DeletePlugin,
]);
