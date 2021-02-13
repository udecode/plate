import * as React from 'react';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import {
  BoldPlugin,
  htmlStringToDOMNode,
  ImagePlugin,
  MARK_BOLD,
} from '../../../index';
import { serializeHTMLFromNodes } from '../index';

it('custom serialize image to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes({
        plugins: [
          {
            ...ImagePlugin(),
            serialize: {
              element: ({ element }: RenderElementProps) =>
                React.createElement('img', { src: element.url }),
            },
          },
        ],
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
    serializeHTMLFromNodes({
      plugins: [
        {
          ...BoldPlugin(),
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
