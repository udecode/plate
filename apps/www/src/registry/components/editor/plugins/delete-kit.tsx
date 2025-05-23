'use client';

import { DeletePlugin, KEYS, SelectOnBackspacePlugin } from '@udecode/plate';

export const DeleteKit = [
  SelectOnBackspacePlugin.configure({
    options: {
      query: {
        allow: [
          KEYS.img,
          KEYS.video,
          KEYS.audio,
          KEYS.file,
          KEYS.mediaEmbed,
          KEYS.hr,
        ],
      },
    },
  }),
  DeletePlugin,
];
