import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import {
  MARK_BOLD,
  TRenderElementProps,
  useBoldPlugin,
  useImagePlugin,
} from '../../../../../slate-plugins/src/index';
import { createEditorPlugins } from '../../../../../slate-plugins/src/utils/createEditorPlugins';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

const plugins = [
  {
    ...useImagePlugin(),
    serialize: {
      element: ({ element }: TRenderElementProps) =>
        React.createElement('img', { src: element.url }),
    },
  },
];

it('custom serialize image to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes(createEditorPlugins({ plugins }), {
        plugins,
        nodes: [
          {
            type: 'img',
            url:
              'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
            children: [],
          },
        ],
      })
    ).innerHTML
  ).toEqual(
    '<img src="https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg">'
  );
});

it('custom serialize bold to html', () => {
  expect(
    serializeHTMLFromNodes(createEditorPlugins({ plugins }), {
      plugins: [
        {
          ...useBoldPlugin(),
          serialize: {
            leaf: ({ leaf, children }: RenderLeafProps) =>
              leaf[MARK_BOLD] && !!leaf.text
                ? React.createElement('b', {}, children)
                : children,
          },
        },
      ],
      nodes: [
        { text: 'Some paragraph of text with ' },
        { text: 'bold', bold: true },
        { text: ' part.' },
      ],
    })
  ).toEqual('Some paragraph of text with <b>bold</b> part.');
});
