import React from 'react';
import { PlatePlugin } from '@udecode/plate-core';
import { RenderLeafProps } from 'slate-react';
import {
  createBoldPlugin,
  createImagePlugin,
  MARK_BOLD,
  TRenderElementProps,
} from '../../../../../plate/src/index';
import { createPlateEditor } from '../../../../../plate/src/utils/createPlateEditor';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

const plugins = [
  {
    ...createImagePlugin(),
    serialize: {
      element: ({ element }: TRenderElementProps) =>
        React.createElement('img', { src: element.url }),
    },
  },
];

it('custom serialize image to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes(createPlateEditor({ plugins }), {
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
    serializeHTMLFromNodes(createPlateEditor({ plugins }), {
      plugins: [
        {
          ...createBoldPlugin(),
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

describe('multiple custom leaf serializers', () => {
  const Bold = ({ children }: any): JSX.Element =>
    React.createElement('b', {}, children);

  const Italic = ({ children }: any): JSX.Element =>
    React.createElement('i', {}, children);

  const normalizeHTML = (html: string): string =>
    new DOMParser().parseFromString(html, 'text/html').body.innerHTML;

  let editor = createPlateEditor();

  beforeEach(() => {
    editor = createPlateEditor();
  });

  it('serialization with the similar renderLeaf/serialize.left options of the same nodes should give the same result', () => {
    const pluginsWithoutSerializers: PlatePlugin[] = [
      { renderLeaf: () => Bold }, // always bold
      { renderLeaf: () => Italic }, // always italic
    ];

    const pluginsWithSerializers: PlatePlugin[] = [
      {
        renderLeaf: () => Bold,
        serialize: { leaf: Bold },
      },
      {
        renderLeaf: () => Italic,
        serialize: { leaf: Italic },
      },
    ];

    const result1 = serializeHTMLFromNodes(editor, {
      plugins: pluginsWithoutSerializers,
      nodes: [{ text: 'any text' }],
    });

    const result2 = serializeHTMLFromNodes(editor, {
      plugins: pluginsWithSerializers,
      nodes: [{ text: 'any text' }],
    });

    expect(normalizeHTML(result1)).toEqual(normalizeHTML(result2));
    expect(normalizeHTML(result2)).toEqual('<i><b>any text</b></i>');
  });
});
