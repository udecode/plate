import { type PluginConfig, createBasePlugin } from '@platejs/core';
import type {
  Element,
  NodeSetNodesOptions,
  NodeUnsetNodesOptions,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type TextIndentConfig = PluginConfig<
  'textIndent',
  { offset: number; unit: string }
>;

export const BaseTextIndentPlugin = createBasePlugin<TextIndentConfig>({
  key: KEYS.textIndent,
  inject: {
    isBlock: true,
    nodeProps: {
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
      transformNodeValue: ({ getOptions, nodeValue }) => {
        const { offset, unit } = getOptions();

        return Number(nodeValue) * offset + unit;
      },
    },
    targetPlugins: [KEYS.p],
  },
  options: {
    offset: 24,
    unit: 'px',
  },
}).extendTx(({ editor, plugin, type }) => (tx) => ({
  set: (value: number, options?: NodeSetNodesOptions<Element>) => {
    const { nodeKey = type } = editor.getInjectProps(plugin);

    tx.nodes.set({ [nodeKey]: value }, options);
  },
  unset: (options?: NodeUnsetNodesOptions<Element>) => {
    const { nodeKey = type } = editor.getInjectProps(plugin);

    tx.nodes.unset(nodeKey, options);
  },
}));
