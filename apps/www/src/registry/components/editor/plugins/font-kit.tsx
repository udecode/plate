'use client';

import type { PlatePluginConfig } from '@udecode/plate/react';

import { KEYS } from '@udecode/plate';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';

const options: PlatePluginConfig = {
  inject: {
    targetPlugins: [KEYS.p],
  },
};

export const FontKit = [
  FontColorPlugin.configure(options),
  FontBackgroundColorPlugin.configure(options),
  FontSizePlugin.configure(options),
];
