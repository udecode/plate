import { type InferConfig, createBasePlugin } from '@platejs/core';
import {
  type Element,
  type NodeSetNodesOptions,
  type NodeUnsetNodesOptions,
  property,
  target,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

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
  initialState: {
    offset: 24,
    unit: 'px',
  },
  targetPluginKeys: [KEYS.p],
  codecs: ({ defineCodecs, store }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const { offset, unit } = store.get();
          const dataValue = element.dataset.textIndent;

          if (dataValue) {
            const value = Number(dataValue);

            return Number.isFinite(value) && value !== 0 ? value : undefined;
          }

          const styleValue = element.style.textIndent;

          if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) {
            return;
          }

          const numericValue = unit
            ? styleValue.slice(0, -unit.length)
            : styleValue;
          const value = Number(numericValue) / offset;

          return Number.isFinite(value) && value !== 0 ? value : undefined;
        },
        encode: ({ value }) => {
          const { offset, unit } = store.get();

          return {
            attributes: { 'data-text-indent': value },
            style: { textIndent: value * offset + unit },
          };
        },
        match: [
          { attributes: { 'data-text-indent': true } },
          { style: { textIndent: '*' } },
        ],
      },
    }),

  inject: {
    isBlock: true,
    nodeProps: {
      styleKey: 'textIndent',
      transformNodeValue: ({ store, nodeValue }) => {
        const { offset, unit } = store.get();

        return Number(nodeValue) * offset + unit;
      },
    },
  },
  update: ({ tx, type }) => ({
    set: (value: number, options?: NodeSetNodesOptions<Element>) => {
      tx.nodes.set({ [type]: value }, options);
    },
    unset: (options?: NodeUnsetNodesOptions<Element>) => {
      tx.nodes.unset(type, options);
    },
  }),
});

export type TextIndentConfig = InferConfig<typeof BaseTextIndentPlugin>;
