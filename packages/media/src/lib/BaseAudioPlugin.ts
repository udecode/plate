import { createSlatePlugin } from '@udecode/plate';

import type { TMediaElement } from './media';

export interface TAudioElement extends TMediaElement {}

export const BaseAudioPlugin = createSlatePlugin({
  key: 'audio',
  node: {
    dangerouslyAllowAttributes: [
      'data-slate-url',
      'data-slate-name',
      'data-slate-width',
      'data-slate-align',
      'data-slate-is-upload',
    ],
    isElement: true,
    isVoid: true,
  },
});
