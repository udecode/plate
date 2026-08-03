'use client';

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
} from '@platejs/basic-styles/react';
import { ParagraphPlugin } from 'platejs/react';

const options = {
  targetPlugins: [ParagraphPlugin],
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
