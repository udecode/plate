import { createSlatePlugin, isPluginStatic } from '@udecode/plate-common';

import type { TMediaElement } from './media';

export interface TFileElement extends TMediaElement {}

export const BaseFilePlugin = createSlatePlugin({
  key: 'file',
  node: { isElement: true, isVoid: true },
  parsers: {
    html: {
      deserializer: {
        parse: ({ element, type }) => {
          if (isPluginStatic(element, type)) {
            const a = element.querySelector('a')!;

            const node: Omit<TFileElement, 'children'> = {
              type,
              url: a.getAttribute('href'),
            };

            const { slateAlign, slateIsUpload, slateWidth } = a.dataset;

            if (slateAlign) {
              node.align = slateAlign as any;
            }
            if (slateIsUpload) {
              node.isUpload = slateIsUpload === 'true';
            }
            if (slateWidth) {
              node.width = slateWidth;
            }

            const name = a.getAttribute('download');

            if (name) {
              node.name = name;
            }

            return node;
          }
        },
      },
    },
  },
});
