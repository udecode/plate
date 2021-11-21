import {
  createImagePlugin,
  createLinkPlugin,
} from '../../../../../plate/src/index';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
import { serializeHtml } from '../serializeHtml';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

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
            attributes: { target: '_blank', rel: 'noopener nofollow' },
            children: [{ text: 'link' }],
          },
          { text: ' part.' },
        ],
      }
    )
  ).toBe(
    'Some paragraph of text with <a href="https://theuselessweb.com/" class="slate-a" target="_blank" rel="noopener nofollow">link</a> part.'
  );
});

it('serialize image with alt to html', () => {
  const plugins = [createImagePlugin()];

  expect(
    htmlStringToDOMNode(
      serializeHtml(createPlateUIEditor({ plugins }), {
        nodes: [
          {
            type: 'img',
            url:
              'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
            attributes: { alt: 'Never gonna give you up' },
            children: [],
          },
        ],
      })
    ).getElementsByTagName('img')[0].outerHTML
  ).toEqual(
    '<img class="slate-ImageElement-img" src="https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg" alt="Never gonna give you up">'
  );
});
