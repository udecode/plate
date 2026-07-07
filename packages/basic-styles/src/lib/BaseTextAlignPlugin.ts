import { createBasePlugin, getInjectMatch } from '@platejs/core';
import type { Element, NodeSetNodesOptions } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type Alignment =
  | 'center'
  | 'end'
  | 'justify'
  | 'left'
  | 'right'
  | 'start';

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseTextAlignPlugin = createBasePlugin({
  key: KEYS.textAlign,
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
    targetPlugins: [KEYS.p],
    targetPluginToInject: ({ editor }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element, node }) => {
              if (element.style.textAlign) {
                node[editor.getType(KEYS.textAlign)] = element.style.textAlign;
              }
            },
          },
        },
      },
    }),
  },
  node: { type: 'align' },
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
