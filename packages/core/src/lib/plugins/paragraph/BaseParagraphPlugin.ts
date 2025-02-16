import { type PluginConfig, createSlatePlugin } from '../../plugin';

export type ParagraphConfig = PluginConfig<'p'>;

export const BaseParagraphPlugin = createSlatePlugin({
  key: 'p',
  node: {
    isElement: true,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'P',
          },
        ],
        query: ({ element }) => element.style.fontFamily !== 'Consolas',
      },
    },
  },
});
