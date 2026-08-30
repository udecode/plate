'use client';

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
} from 'platejs/react';

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
