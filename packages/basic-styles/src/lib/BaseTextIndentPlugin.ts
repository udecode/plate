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

const parseTextIndent = (
  element: Readonly<HTMLElement>,
  offset: number,
  unit: string
) => {
  const dataValue = element.dataset.textIndent;

  if (dataValue) {
    const value = Number(dataValue);

    return Number.isFinite(value) && value !== 0 ? value : undefined;
  }
  const styleValue = element.style.textIndent;

  if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) return;

  const numericValue = unit ? styleValue.slice(0, -unit.length) : styleValue;
  const value = Number(numericValue) / offset;

  return Number.isFinite(value) && value !== 0 ? value : undefined;
};

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
})
  .extendHtmlCodec(({ getOptions }) => ({
    decode: ({ element }) => {
      const { offset, unit } = getOptions();

      return parseTextIndent(element, offset, unit);
    },
    encode: ({ value }) => {
      const { offset, unit } = getOptions();

      return {
        attributes: { 'data-text-indent': value },
        style: { textIndent: value * offset + unit },
      };
    },
    match: [
      { attributes: { 'data-text-indent': true } },
      { style: { textIndent: '*' } },
    ],
  }))
  .extendTx(({ type }) => (tx) => ({
    set: (value: number, options?: NodeSetNodesOptions<Element>) => {
      tx.nodes.set({ [type]: value }, options);
    },
    unset: (options?: NodeUnsetNodesOptions<Element>) => {
      tx.nodes.unset(type, options);
    },
  }));

export type TextIndentConfig = InferConfig<typeof BaseTextIndentPlugin>;
