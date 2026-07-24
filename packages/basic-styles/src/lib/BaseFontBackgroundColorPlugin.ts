import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontBackgroundColorPlugin = createBasePlugin({
  key: KEYS.backgroundColor,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'backgroundColor',
    },
  },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) => element.style.backgroundColor || undefined,
    encode: ({ value }) => ({
      style: { backgroundColor: value },
      tag: 'span',
    }),
    match: [{ style: { backgroundColor: '*' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    clear: () => {
      tx.marks.remove(type);
    },
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }));
