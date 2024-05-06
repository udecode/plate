import { htmlStringToDOMNode } from '@udecode/plate-core';
import { createLinkPlugin } from '@udecode/plate-link';
import { createImagePlugin } from '@udecode/plate-media';
import { createPlateUIEditor } from 'www/src/lib/plate/create-plate-ui-editor';

import { serializeHtml } from '../../serializeHtml';

it('serialize link to html with attributes', () => {
  const plugins = [
    createLinkPlugin({
      props: {
        rel: 'noopener nofollow',
        target: '_blank',
      },
    }),
  ];

  expect(
    serializeHtml(
      createPlateUIEditor({
        plugins,
      }),
      {
        nodes: [
          { text: 'Some paragraph of text with ' },
          {
            attributes: { rel: 'noopener nofollow' },
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://theuselessweb.com/',
          },
          { text: ' part.' },
        ],
      }
    )
  ).toBe(
    `Some paragraph of text with <a class="slate-a" href="https://theuselessweb.com/" target="_blank" rel="noopener nofollow">link</a> part.`
  );
});

it('serialize image with alt to html', () => {
  const plugins = [createImagePlugin()];

  const element = {
    attributes: { alt: 'Never gonna give you up' },
    children: [],
    type: 'img',
    url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
  };

  expect(
    htmlStringToDOMNode(
      serializeHtml(createPlateUIEditor({ plugins }), {
        nodes: [element],
      })
    ).querySelectorAll('img')[0].outerHTML
  ).toEqual(
    '<img src="https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg" draggable="true" alt="Never gonna give you up">'
  );
});
