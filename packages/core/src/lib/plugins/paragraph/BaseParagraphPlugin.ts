import { schema } from '@platejs/plite';

import { defineBasePlugin, type DefinitionOf } from '../../plugin';

export const BaseParagraphPlugin = defineBasePlugin('paragraph', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.style.fontFamily === 'Consolas' ? undefined : {},
        encode: ({ content }) => ({ children: content, tag: 'p' }),
        match: [{ tag: 'p' }],
      },
    }),
  rules: {
    merge: { removeEmpty: true },
  },
  schema: {
    element: schema.element.textBlock(),
  },
});

export type BaseParagraphDefinition = DefinitionOf<typeof BaseParagraphPlugin>;
