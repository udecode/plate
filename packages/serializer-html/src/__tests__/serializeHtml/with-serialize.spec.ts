import React from 'react';
import { createBoldPlugin } from '@udecode/plate';
import { createPlateEditor } from '@udecode/plate-core';
import { htmlStringToDOMNode } from '@udecode/plate-core';
import { PlatePlugin } from '@udecode/plate-core';
import { createImagePlugin } from '@udecode/plate-media';
import { createPlateUIEditor } from 'www/src/lib/plate/createPlateUIEditor';

import { MARK_BOLD } from '@/packages/basic-marks/src/index';
import { serializeHtml } from '@/packages/serializer-html/src/serializeHtml';

const plugins = [
  createImagePlugin({
    serializeHtml: ({ element }) =>
      React.createElement('img', { src: element.url }),
  }),
];

it('custom serialize image to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(createPlateUIEditor({ plugins }), {
        nodes: [
          {
            type: 'img',
            url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
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
    serializeHtml(
      createPlateUIEditor({
        plugins: [
          createBoldPlugin({
            serializeHtml: ({ leaf, children }) =>
              leaf[MARK_BOLD] && !!leaf.text
                ? React.createElement('b', {}, children)
                : children,
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

function Bold({ children }: any): JSX.Element {
  return React.createElement('b', {}, children);
}

describe('multiple custom leaf serializers', () => {
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
        serializeHtml: Bold,
      },
    ];

    const result1 = serializeHtml(
      createPlateEditor({
        plugins: pluginsWithoutSerializers,
      }),
      {
        nodes: [{ text: 'any text', bold: true }],
      }
    );

    const result2 = serializeHtml(
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
