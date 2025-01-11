import { createSlatePlugin } from '@udecode/plate-common';

import type { TMediaElement } from '..';

export interface TVideoElement extends TMediaElement {}

export const BaseVideoPlugin = createSlatePlugin({
  key: 'video',
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
