import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontColorPlugin = createBasePlugin({
  key: KEYS.color,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
      styleKey: 'color',
    },
  },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) => element.style.color || undefined,
    encode: ({ value }) => ({
      style: { color: value },
      tag: 'span',
    }),
    match: [{ style: { color: '*' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    clear: () => {
      tx.marks.remove(type);
    },
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }));
