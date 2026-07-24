import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontSizePlugin = createBasePlugin({
  key: KEYS.fontSize,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'fontSize',
    },
  },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) => element.style.fontSize || undefined,
    encode: ({ value }) => ({
      style: { fontSize: value },
      tag: 'span',
    }),
    match: [{ style: { fontSize: '*' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }));
