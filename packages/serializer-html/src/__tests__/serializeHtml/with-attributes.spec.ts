import { createLinkPlugin } from '@/packages/link/src/index';
import { serializeHtml } from '@/packages/serializer-html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/create-plate-ui-editor';
import { htmlStringToDOMNode } from '@udecode/plate-core';
import { createImagePlugin } from '@udecode/plate-media';

it('serialize link to html with attributes', () => {
  const plugins = [
    createLinkPlugin({
      props: {
        target: '_blank',
        rel: 'noopener nofollow',
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
            type: 'a',
            url: 'https://theuselessweb.com/',
            attributes: { rel: 'noopener nofollow' },
            children: [{ text: 'link' }],
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
    type: 'img',
    url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
    attributes: { alt: 'Never gonna give you up' },
    children: [],
  };

  expect(
    htmlStringToDOMNode(
      serializeHtml(createPlateUIEditor({ plugins }), {
        nodes: [element],
      })
    ).querySelectorAll('img')[0].outerHTML
  ).toEqual(
    '<img src="https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg" alt="Never gonna give you up" draggable="true">'
  );
});
