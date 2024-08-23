import { type PluginConfig, createSlatePlugin } from '../../plugin';

export type ParagraphConfig = PluginConfig<'p'>;

export const ParagraphPlugin = createSlatePlugin({
  isElement: true,
  key: 'p',
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
