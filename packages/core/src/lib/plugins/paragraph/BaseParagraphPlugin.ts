import { schema } from '@platejs/plite';

import { createBasePlugin } from '../../plugin';

export const BaseParagraphPlugin = createBasePlugin({
  key: 'p',
  schema: {
    element: {
      content: schema.content.any(
        [schema.content.text(), schema.content.group('inline')],
        { default: 'text', min: 1 }
      ),
    },
  },
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
});
