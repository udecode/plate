import { schema } from '@platejs/plite';

import { createBasePlugin, type DefinitionOf } from '../../plugin';

export const BaseParagraphPlugin = createBasePlugin({
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.style.fontFamily === 'Consolas' ? undefined : {},
        encode: ({ content }) => ({ children: content, tag: 'p' }),
        match: [{ tag: 'p' }],
      },
    }),
  name: 'p',
  rules: {
    merge: { removeEmpty: true },
  },
  schema: {
    element: schema.element.textBlock(),
  },
});

export type BaseParagraphDefinition = DefinitionOf<typeof BaseParagraphPlugin>;
