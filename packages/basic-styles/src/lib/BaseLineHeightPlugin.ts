import { createBasePlugin, getInjectMatch } from '@platejs/core';
import type { Element, NodeSetNodesOptions } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/**
 * Enables support for text alignment, useful to align your content to left,
 * right and center it.
 */
export const BaseLineHeightPlugin = createBasePlugin({
  key: KEYS.lineHeight,
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    },
    targetPlugins: [KEYS.p],
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element }) => {
              if (element.style.lineHeight) {
                return {
                  [editor.getType(plugin.key)]: element.style.lineHeight,
                };
              }
            },
          },
        },
      },
    }),
  },
}).extendTx(({ editor, plugin, type }) => (tx) => ({
  set: (value: number, options?: NodeSetNodesOptions<Element>) => {
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
