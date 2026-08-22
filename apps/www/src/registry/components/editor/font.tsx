'use client';

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
} from '@platejs/basic-styles/react';

export const FontKit = [
  FontColorPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 'black',
      },
    },
  }),
  FontBackgroundColorPlugin,
  FontSizePlugin,
  FontFamilyPlugin,
];
