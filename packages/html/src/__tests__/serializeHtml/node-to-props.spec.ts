import { CaptionPlugin } from '@udecode/plate-caption/react';
import { htmlStringToDOMNode } from '@udecode/plate-core';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ImagePlugin } from '@udecode/plate-media/react';

import { serializeHtml } from '../../react/serializeHtml';
import { createPlateUIEditor } from '../create-plate-ui-editor';

const plugins = [
  LinkPlugin.extend(() => ({
    node: {
      props: ({ element }) =>
        /^https?:\/\/slatejs.org\/?/.test((element as any).url)
          ? {}
          : { target: '_blank' },
    },
  })),
  CaptionPlugin,
  ImagePlugin.extend({
    node: {
      props: ({ element }) => ({
        alt: (element as any).attributes?.alt,
        width: (element as any).url.split('/').pop(),
      }),
    },
  }),
];

it('serialize link to html with attributes', () => {
  const editor = createPlateUIEditor({
    plugins,
  });

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
  const editor = createPlateUIEditor({
    plugins,
  });

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
    '<img draggable="true" src="https://via.placeholder.com/300" alt="Placeholder">'
  );
});
