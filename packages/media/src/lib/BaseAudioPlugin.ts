import { createSlatePlugin, isPluginStatic } from '@udecode/plate-common';

import type { TMediaElement } from './media';

export interface TAudioElement extends TMediaElement {}

export const BaseAudioPlugin = createSlatePlugin({
  key: 'audio',
  node: { isElement: true, isVoid: true },
  parsers: {
    html: {
      deserializer: {
        parse: ({ element, type }) => {
          if (isPluginStatic(element, type)) {
            const audio = element.querySelector('audio')!;

            const node: Omit<TAudioElement, 'children'> = {
              type,
              url: audio.src,
            };

            const { slateAlign, slateIsUpload, slateWidth } = audio.dataset;

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
