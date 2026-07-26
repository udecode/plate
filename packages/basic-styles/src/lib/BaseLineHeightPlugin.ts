import {
  type InferConfig,
  createBasePlugin,
  getInjectMatch,
} from '@platejs/core';
import {
  type Element,
  type NodeSetNodesOptions,
  property,
  target,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

const defaultTargetPluginKeys: readonly string[] = [KEYS.p];

const parseLineHeight = (value: string) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : value;
};

/**
 * Enables configurable line spacing on targeted block elements.
 */
export const BaseLineHeightPlugin = createBasePlugin({
  key: KEYS.lineHeight,
  schema: ({ own, plugins, targetPluginKeys }) => ({
    properties: [
      own.elementProperty(
        property.json({
          validate: (value): value is number | string =>
            (typeof value === 'number' && Number.isFinite(value)) ||
            typeof value === 'string',
          validationVersion: 1,
        }),
        {
          target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
  }),
  targetPluginKeys: defaultTargetPluginKeys,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.style.lineHeight
            ? parseLineHeight(element.style.lineHeight)
            : undefined,
        encode: ({ value }) => ({ style: { lineHeight: value } }),
        match: [{ style: { lineHeight: '*' } }],
      },
    }),

  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 1.5,
    },
  },
  update: ({ editor, plugin, tx, type }) => ({
    set: (value: number, options?: NodeSetNodesOptions<Element>) => {
      const { defaultNodeValue } = editor.getInjectProps(plugin);
      const match = getInjectMatch(editor, plugin);

      if (value === defaultNodeValue) {
        tx.nodes.unset(type, {
          match,
          ...options,
        });
        return;
      }

      tx.nodes.set(
        { [type]: value },
        {
          match,
          ...options,
        }
      );
    },
  }),
});

export type LineHeightConfig = InferConfig<typeof BaseLineHeightPlugin>;
