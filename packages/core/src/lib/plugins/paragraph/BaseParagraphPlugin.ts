import { type PluginConfig, createSlatePlugin } from '../../plugin';

export type ParagraphConfig = PluginConfig<'p'>;

export const BaseParagraphPlugin = createSlatePlugin({
  key: 'p',
  node: {
    dangerouslyAllowAttributes: [
      'data-slate-type',
      'data-slate-indent',
      'data-slate-list-start',
      'data-slate-list-style-type',
      'data-slate-checked',
    ],
    isElement: true,
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
        toNodeProps: ({ element }) => {
          const { slateIndent } = element.dataset;

          if (slateIndent !== undefined) {
            return {
              indent: Number(slateIndent),
            };
          }
        },
      },
    },
  },
});
