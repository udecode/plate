'use client';

import { AlignPlugin } from '@udecode/plate-alignment/react';
import { HEADING_LEVELS } from '@udecode/plate-heading';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { ParagraphPlugin } from '@udecode/plate/react';

export const AlignKit = [
  AlignPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        ...HEADING_LEVELS,
        ImagePlugin.key,
        MediaEmbedPlugin.key,
      ],
    },
  }),
];
