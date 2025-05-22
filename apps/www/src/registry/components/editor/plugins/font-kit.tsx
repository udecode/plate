'use client';

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { type PlatePluginConfig, ParagraphPlugin } from '@udecode/plate/react';

const options: PlatePluginConfig = {
  inject: {
    targetPlugins: [ParagraphPlugin.key],
  },
};

export const FontKit = [
  FontColorPlugin.configure(options),
  FontBackgroundColorPlugin.configure(options),
  FontSizePlugin.configure(options),
];
