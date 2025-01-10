import { type PluginConfig, createSlatePlugin } from '../../plugin';

export type ParagraphConfig = PluginConfig<'p'>;

export const BaseParagraphPlugin = createSlatePlugin({
  key: 'p',
  node: {
    isElement: true,
    toDataAttributes: ['indent', 'listStart', 'listStyleType', 'checked'],
  },
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
