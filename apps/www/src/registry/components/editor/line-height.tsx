'use client';

import { PLUGINS } from 'platejs';
import { LineHeightPlugin } from 'platejs/react';

export const LineHeightKit = [
  LineHeightPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 1.5,
        validNodeValues: [1, 1.2, 1.5, 2, 3],
      },
    },
    targetPlugins: [PLUGINS.heading, PLUGINS.paragraph],
  }),
];
