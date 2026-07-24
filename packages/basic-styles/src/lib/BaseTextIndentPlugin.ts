import { type InferConfig, createBasePlugin } from '@platejs/core';
import {
  type Element,
  type NodeSetNodesOptions,
  type NodeUnsetNodesOptions,
  property,
  target,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

const defaultTargetPluginKeys: readonly string[] = [KEYS.p];

export const BaseTextIndentPlugin = createBasePlugin({
  key: KEYS.textIndent,
  schema: ({ own, plugins, targetPluginKeys }) => ({
    properties: [
      own.elementProperty(property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  inject: {
    isBlock: true,
    nodeProps: {
      styleKey: 'textIndent',
      transformNodeValue: ({ getOptions, nodeValue }) => {
        const { offset, unit } = getOptions();

        return Number(nodeValue) * offset + unit;
      },
    },
  },
  options: {
    offset: 24,
    unit: 'px',
  },
  targetPluginKeys: defaultTargetPluginKeys,
}).extendTx(({ type }) => (tx) => ({
  set: (value: number, options?: NodeSetNodesOptions<Element>) => {
    tx.nodes.set({ [type]: value }, options);
  },
  unset: (options?: NodeUnsetNodesOptions<Element>) => {
    tx.nodes.unset(type, options);
  },
}));

export type TextIndentConfig = InferConfig<typeof BaseTextIndentPlugin>;
