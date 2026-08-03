'use client';

import { LineHeightPlugin } from '@platejs/basic-styles/react';
import { PLUGINS } from 'platejs';

export const LineHeightKit = [
  LineHeightPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 1.5,
        validNodeValues: [1, 1.2, 1.5, 2, 3],
      },
    },
    targetPlugins: [
      PLUGINS.h1,
      PLUGINS.h2,
      PLUGINS.h3,
      PLUGINS.h4,
      PLUGINS.h5,
      PLUGINS.h6,
      PLUGINS.paragraph,
    ],
  }),
];
