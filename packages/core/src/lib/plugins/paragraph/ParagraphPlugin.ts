import { createPlugin } from '../../plugin';

export const ParagraphPlugin = createPlugin({
  deserializeHtml: {
    query: ({ element }) => element.style.fontFamily !== 'Consolas',
    rules: [
      {
        validNodeName: 'P',
      },
    ],
  },
  isElement: true,
  key: 'p',
});
