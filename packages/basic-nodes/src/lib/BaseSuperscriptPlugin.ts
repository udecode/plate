import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for superscript formatting. */
export const BaseSuperscriptPlugin = createBasePlugin({
  key: KEYS.sup,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'sup' },
  rules: { selection: { affinity: 'directional' } },
})
  .extendHtmlCodec(() => ({
    decode: () => true,
    encode: ({ value }) => (value ? { tag: 'sup' } : null),
    match: [{ tag: 'sup' }, { style: { verticalAlign: 'super' } }],
  }))
  .extendTx(({ editor, type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type, true, {
        clear: editor.getType(KEYS.sub),
      });
    },
  }));
