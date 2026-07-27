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
  targetPluginKeys: [KEYS.p],
  type: 'align',
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.textAlign || undefined,
        encode: ({ value }) => ({ style: { textAlign: value } }),
        match: [
          {
            style: {
              textAlign: ['start', 'left', 'center', 'right', 'end', 'justify'],
            },
          },
        ],
      },
    }),

  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
  },
  update: ({ editor, plugin, tx, type }) => ({
    set: (value: Alignment, options?: NodeSetNodesOptions<Element>) => {
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

export type TextAlignConfig = InferConfig<typeof BaseTextAlignPlugin>;
