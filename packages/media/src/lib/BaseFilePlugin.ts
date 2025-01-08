import { createSlatePlugin, isPluginStatic } from '@udecode/plate-common';

import type { TMediaElement } from './media';

export interface TFileElement extends TMediaElement {}

export const BaseFilePlugin = createSlatePlugin({
  key: 'file',
  node: { isElement: true, isVoid: true },
  parsers: {
    html: {
      deserializer: {
        parse: ({ element }) => {
          if (!isPluginStatic(element, BaseFilePlugin.key)) return;

          const a = element.querySelector('a')!;

          return {
            name: a.getAttribute('download'),
            type: 'file',
            url: a.getAttribute('href'),
          };
        },
        rules: [
          {
            validClassName: 'slate-file',
            validNodeName: 'DIV',
          },
        ],
      },
    },
  },
});
