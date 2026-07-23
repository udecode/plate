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
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['CODE'] },
          { validStyle: { fontFamily: 'Consolas' } },
        ],
        query({ element }) {
          const blockAbove = findHtmlParentElement(element, 'P');

          if (blockAbove?.style.fontFamily === 'Consolas') return false;

          return !findHtmlParentElement(element, 'PRE');
        },
      },
    },
  },
  render: { as: 'code' },
  rules: { selection: { affinity: 'hard' } },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
