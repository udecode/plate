import { type PluginConfig, createTSlatePlugin, KEYS } from '@udecode/plate';

export type TextIndentConfig = PluginConfig<
  'textIndent',
  { offset: number; unit: string }
>;

export const BaseTextIndentPlugin = createTSlatePlugin<TextIndentConfig>({
  key: KEYS.textIndent,
  inject: {
    isBlock: true,
    nodeProps: {
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
      transformNodeValue({ getOptions, nodeValue }) {
        const { offset, unit } = getOptions();

        return nodeValue * offset! + unit!;
      },
    },
    targetPlugins: [KEYS.p],
  },
  options: {
    offset: 24,
    unit: 'px',
  },
});
