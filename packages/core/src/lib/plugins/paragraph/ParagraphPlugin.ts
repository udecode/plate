import { type PluginConfig, createSlatePlugin } from '../../plugin';

export type ParagraphConfig = PluginConfig<'p'>;

export const ParagraphPlugin = createSlatePlugin({
  key: 'p',
  node: { isElement: true },
  parsers: {
    html: {
      deserializer: {
        query: ({ element }) => element.style.fontFamily !== 'Consolas',
        rules: [
          {
            validNodeName: 'P',
          },
        ],
      },
    },
  },
});
