import {
  createBasePlugin,
  createRuleFactory,
  someHtmlElement,
} from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const UnderlineRules = {
  markdown: createRuleFactory({
    type: 'mark',
    end: '_',
    start: '__',
    trigger: '_',
  }),
};

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = createBasePlugin({
  key: KEYS.underline,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(
            element,
            (node) => node.style.textDecoration === 'none'
          )
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'u' } : null),
        match: [{ tag: 'u' }, { style: { textDecoration: 'underline' } }],
      },
    }),

  render: { as: 'u' },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});
