import { createSlatePlugin } from '../../plugin';

export const ParagraphPlugin = createSlatePlugin({
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
