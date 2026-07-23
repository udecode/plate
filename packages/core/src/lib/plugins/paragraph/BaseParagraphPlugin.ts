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
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'P',
          },
        ],
        query: ({ element }) => element.style.fontFamily !== 'Consolas',
      },
    },
  },
  rules: {
    merge: { removeEmpty: true },
  },
});
