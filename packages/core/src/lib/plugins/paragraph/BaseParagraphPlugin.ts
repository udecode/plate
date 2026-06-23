import { type PluginConfig, createEditorPlugin } from '../../plugin';

export type ParagraphConfig = PluginConfig<'p'>;

export const BaseParagraphPlugin = createEditorPlugin({
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
  rules: {
    merge: { removeEmpty: true },
  },
});
