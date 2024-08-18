import React from 'react';

import { BoldPlugin } from '@udecode/plate-basic-marks';
import {
  type PlatePlugins,
  createSlatePlugin,
  htmlStringToDOMNode,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-core/react';
import { ImagePlugin } from '@udecode/plate-media';

import { serializeHtml } from '../../react/serializeHtml';
import { createPlateUIEditor } from '../create-plate-ui-editor';

const plugins = [
  ImagePlugin.extend({
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
            children: [],
            type: 'img',
            url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
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
          BoldPlugin.extend({
            serializeHtml: ({ children, leaf }) =>
              leaf[BoldPlugin.key] && !!leaf.text
                ? React.createElement('b', {}, children)
                : children,
          }),
        ],
      }),
      {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { bold: true, text: 'bold' },
          { text: ' part.' },
        ],
      }
    )
  ).toEqual('Some paragraph of text with <b>bold</b> part.');
});

function Bold({ children }: any): React.ReactElement {
  return React.createElement('b', {}, children);
}

describe('multiple custom leaf serializers', () => {
  const normalizeHTML = (html: string): string =>
    new DOMParser().parseFromString(html, 'text/html').body.innerHTML;

  it('serialization with the similar renderLeaf/serialize.left options of the same nodes should give the same result', () => {
    const pluginsWithoutSerializers: PlatePlugins = [
      createSlatePlugin({ component: Bold as any, isLeaf: true, key: 'bold' }), // always bold
    ];

    const pluginsWithSerializers: PlatePlugins = [
      createSlatePlugin({
        component: Bold as any,
        isLeaf: true,
        key: 'bold',
        serializeHtml: Bold,
      }),
    ];

    const result1 = serializeHtml(
      createPlateEditor({
        plugins: pluginsWithoutSerializers,
      }),
      {
        nodes: [{ bold: true, text: 'any text' }],
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
