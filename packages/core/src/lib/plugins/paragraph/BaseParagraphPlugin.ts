import { createBasePlugin } from '../../plugin';

export const BaseParagraphPlugin = createBasePlugin({
  key: 'p',
  node: {
    isElement: true,
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
