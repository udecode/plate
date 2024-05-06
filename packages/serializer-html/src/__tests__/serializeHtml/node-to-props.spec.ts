import { htmlStringToDOMNode } from '@udecode/plate-core';
import { createLinkPlugin } from '@udecode/plate-link';
import { createImagePlugin } from '@udecode/plate-media';
import { createPlateUIEditor } from 'www/src/lib/plate/create-plate-ui-editor';

import { serializeHtml } from '../../serializeHtml';

const plugins = [
  createLinkPlugin({
    props: ({ element }) =>
      /^https?:\/\/slatejs.org\/?/.test((element as any).url)
        ? {}
        : { target: '_blank' },
  }),
  createImagePlugin({
    props: ({ element }) => ({
      alt: (element as any).attributes?.alt,
      width: (element as any).url.split('/').pop(),
    }),
  }),
];

const editor = createPlateUIEditor({
  plugins,
});

it('serialize link to html with attributes', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'An external ' },
        {
          children: [{ text: 'link' }],
          type: 'a',
          url: 'https://theuselessweb.com/',
        },
        { text: ' and an internal ' },
        {
          children: [{ text: 'link' }],
          target: '_self',
          type: 'a',
          url: 'https://slatejs.org/',
        },
        { text: '.' },
      ],
    })
  ).toBe(
    `An external <a class="slate-a" href="https://theuselessweb.com/" target="_blank">link</a> and an internal <a class="slate-a" href="https://slatejs.org/" target="_self">link</a>.`
  );
});

it('serialize image with alt to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            attributes: { alt: 'Placeholder' },
            children: [],
            type: 'img',
            url: 'https://via.placeholder.com/300',
          },
        ],
      })
    ).querySelectorAll('img')[0].outerHTML
  ).toEqual(
    '<img src="https://via.placeholder.com/300" draggable="true" alt="Placeholder">'
  );
});
