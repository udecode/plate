import { type PluginConfig, createSlatePlugin } from '../../plugin';

export type ParagraphConfig = PluginConfig<'p'>;

export const ParagraphPlugin = createSlatePlugin({
  deserializeHtml: {
    query: ({ element }) => element.style.fontFamily !== 'Consolas',
    rules: [
      {
        validNodeName: 'P',
      },
    ],
  },
  isElement: true,
  key: 'p',
});
