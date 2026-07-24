import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontFamilyPlugin = createBasePlugin({
  key: KEYS.fontFamily,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'fontFamily',
    },
  },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) => element.style.fontFamily || undefined,
    encode: ({ value }) => ({
      style: { fontFamily: value },
      tag: 'span',
    }),
    match: [{ style: { fontFamily: '*' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }));
