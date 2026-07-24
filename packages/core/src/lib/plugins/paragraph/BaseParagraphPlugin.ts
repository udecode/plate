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
  rules: {
    merge: { removeEmpty: true },
  },
}).extendHtmlCodec(() => ({
  decode: ({ element }) =>
    element.style.fontFamily === 'Consolas' ? undefined : {},
  encode: ({ content }) => ({ children: content, tag: 'p' }),
  match: [{ tag: 'p' }],
}));
