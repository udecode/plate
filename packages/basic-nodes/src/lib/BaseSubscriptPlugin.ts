import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for subscript formatting. */
export const BaseSubscriptPlugin = createBasePlugin({
  key: KEYS.sub,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'sub' },
  rules: { selection: { affinity: 'directional' } },
})
  .extendHtmlCodec(() => ({
    decode: () => true,
    encode: ({ value }) => (value ? { tag: 'sub' } : null),
    match: [{ tag: 'sub' }, { style: { verticalAlign: 'sub' } }],
  }))
  .extendTx(({ editor, type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type, true, {
        clear: editor.getType(KEYS.sup),
      });
    },
  }));
