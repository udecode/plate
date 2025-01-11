import { createSlatePlugin } from '@udecode/plate-common';

import type { TMediaElement } from './media';

export interface TFileElement extends TMediaElement {}

export const BaseFilePlugin = createSlatePlugin({
  key: 'file',
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
  parsers: {
    html: {
      deserializer: {
        toNodeProps: ({ element }) => {
          const { slateIsUpload } = element.dataset;

          if (slateIsUpload !== undefined) {
            return {
              isUpload: Boolean(slateIsUpload),
            };
          }
        },
      },
    },
  },
});
