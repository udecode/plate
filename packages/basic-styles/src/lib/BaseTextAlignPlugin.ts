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

export type Alignment =
  | 'center'
  | 'end'
  | 'justify'
  | 'left'
  | 'right'
  | 'start';

const defaultTargetPluginKeys: readonly string[] = [KEYS.p];

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseTextAlignPlugin = createBasePlugin({
  key: KEYS.textAlign,
  schema: ({ own, plugins, targetPluginKeys }) => ({
    properties: [
      own.elementProperty(property.string(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
    targetPluginToInject: ({ type }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element }) => {
              if (element.style.textAlign) {
                return { [type]: element.style.textAlign };
              }
            },
          },
        },
      },
    }),
  },
  targetPluginKeys: defaultTargetPluginKeys,
  type: 'align',
}).extendTx(({ editor, plugin, type }) => (tx) => ({
  set: (value: Alignment, options?: NodeSetNodesOptions<Element>) => {
    const { defaultNodeValue, nodeKey = type } = editor.getInjectProps(plugin);
    const match = getInjectMatch(editor, plugin);

    if (value === defaultNodeValue) {
      tx.nodes.unset(nodeKey, {
        match,
        ...options,
      });
      return;
    }

    tx.nodes.set(
      { [nodeKey]: value },
      {
        match,
        ...options,
      }
    );
  },
}));

export type TextAlignConfig = InferConfig<typeof BaseTextAlignPlugin>;
