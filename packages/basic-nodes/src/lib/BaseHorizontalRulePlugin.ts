import { createBasePlugin, createRuleFactory } from '@platejs/core';
import { KEYS } from '@platejs/utils';

const thematicBreakDashRe = /^(--|—)$/;

export const HorizontalRuleRules = {
  markdown: createRuleFactory<{}, { variant: '-' | '_' }>({
    type: 'blockStart',
    variant: '-',
    match: ({ variant }) => (variant === '_' ? '___' : thematicBreakDashRe),
    trigger: ({ variant }) => (variant === '_' ? ' ' : '-'),
    apply: ({ tx, variant }) => {
      if (variant === '_') {
        tx.text.deleteBackward({ unit: 'character' });
      }

      tx.nodes.set({ type: KEYS.hr });
      tx.nodes.insert({
        children: [{ text: '' }],
        type: KEYS.p,
      });

      return true;
    },
  }),
};

export const BaseHorizontalRulePlugin = createBasePlugin({
  key: KEYS.hr,
  schema: {
    element: {
      void: 'block',
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: () => ({ tag: 'hr' }),
        match: [{ tag: 'hr' }],
      },
    }),

  render: { as: 'hr' },
});
