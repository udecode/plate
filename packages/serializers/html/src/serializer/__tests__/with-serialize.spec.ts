import React from 'react';
import { createPlateEditor, PlatePlugin } from '@udecode/plate-core';
import { RenderLeafProps } from 'slate-react';
import {
  createBoldPlugin,
  createImagePlugin,
  MARK_BOLD,
  TRenderElementProps,
} from '../../../../../plate/src/index';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

const plugins = [
  createImagePlugin({
    serialize: {
      element: ({ element }: TRenderElementProps) =>
        React.createElement('img', { src: element.url }),
    },
  }),
];

it('custom serialize image to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes(createPlateUIEditor({ plugins }), {
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
    serializeHTMLFromNodes(
      createPlateUIEditor({
        plugins: [
          createBoldPlugin({
            serialize: {
              leaf: ({ leaf, children }: RenderLeafProps) =>
                leaf[MARK_BOLD] && !!leaf.text
                  ? React.createElement('b', {}, children)
                  : children,
            },
          }),
        ],
      }),
      {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'bold', bold: true },
          { text: ' part.' },
        ],
      }
    )
  ).toEqual('Some paragraph of text with <b>bold</b> part.');
});

describe('multiple custom leaf serializers', () => {
  const Bold = ({ children }: any): JSX.Element =>
    React.createElement('b', {}, children);

  const normalizeHTML = (html: string): string =>
    new DOMParser().parseFromString(html, 'text/html').body.innerHTML;

  it('serialization with the similar renderLeaf/serialize.left options of the same nodes should give the same result', () => {
    const pluginsWithoutSerializers: PlatePlugin[] = [
      { key: 'bold', isLeaf: true, component: Bold as any }, // always bold
    ];

    const pluginsWithSerializers: PlatePlugin[] = [
      {
        key: 'bold',
        isLeaf: true,
        component: Bold as any,
        serialize: { leaf: Bold },
      },
    ];

    const result1 = serializeHTMLFromNodes(
      createPlateEditor({
        plugins: pluginsWithoutSerializers,
      }),
      {
        nodes: [{ text: 'any text', bold: true }],
      }
    );

    const result2 = serializeHTMLFromNodes(
      createPlateEditor({
        plugins: pluginsWithSerializers,
      }),
      {
        nodes: [{ text: 'any text' }],
      }
    );

    expect(normalizeHTML(result1)).toEqual(normalizeHTML(result2));
    expect(normalizeHTML(result2)).toEqual('<b>any text</b>');
  });
});
