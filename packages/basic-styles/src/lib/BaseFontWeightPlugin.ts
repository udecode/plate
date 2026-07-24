import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontWeightPlugin = createBasePlugin({
  key: KEYS.fontWeight,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'fontWeight',
    },
  },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) => element.style.fontWeight || undefined,
    encode: ({ value }) => ({
      style: { fontWeight: value },
      tag: 'span',
    }),
    match: [{ style: { fontWeight: '*' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }));
