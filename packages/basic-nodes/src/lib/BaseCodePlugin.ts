import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { findHtmlParentElement } from '@udecode/utils';

/** Enables support for code formatting */
export const BaseCodePlugin = createBasePlugin({
  key: KEYS.code,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'code' },
  rules: { selection: { affinity: 'hard' } },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) => {
      const blockAbove = findHtmlParentElement(element, 'P');

      return blockAbove?.style.fontFamily === 'Consolas' ||
        findHtmlParentElement(element, 'PRE')
        ? undefined
        : true;
    },
    encode: ({ value }) => (value ? { tag: 'code' } : null),
    match: [{ tag: 'code' }, { style: { fontFamily: 'Consolas' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }));
