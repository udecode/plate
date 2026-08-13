'use client';

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
} from '@platejs/basic-styles/react';
import { PLUGINS } from '@platejs/utils';

const options = {
  targetPlugins: [PLUGINS.paragraph],
};

export const FontKit = [
  FontColorPlugin.configure({
    ...options,
    inject: {
      nodeProps: {
        defaultNodeValue: 'black',
      },
    },
  }),
  FontBackgroundColorPlugin.configure(options),
  FontSizePlugin.configure(options),
  FontFamilyPlugin.configure(options),
];
