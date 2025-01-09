import { createSlatePlugin, isPluginStatic } from '@udecode/plate-common';

import type { TMediaElement } from '..';

export interface TVideoElement extends TMediaElement {}

export const BaseVideoPlugin = createSlatePlugin({
  key: 'video',
  node: {
    dangerouslyAllowAttributes: ['width', 'height'],
    isElement: true,
    isVoid: true,
  },
  parsers: {
    html: {
      deserializer: {
        parse: ({ element, type }) => {
          if (isPluginStatic(element, type)) {
            const video = element.querySelector('video')!;

            const node: Omit<TMediaElement, 'children'> = {
              type,
              url: video.src,
            };

            const { slateAlign, slateIsUpload, slateWidth } = video.dataset;

            if (slateAlign) {
              node.align = slateAlign as any;
            }
            if (slateIsUpload) {
              node.isUpload = slateIsUpload === 'true';
            }
            if (slateWidth) {
              node.width = slateWidth;
            }

            return node;
          }
        },
      },
    },
  },
});
