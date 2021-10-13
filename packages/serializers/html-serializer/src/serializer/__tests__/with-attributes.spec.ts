import {
  createImagePlugin,
  createLinkPlugin,
} from '../../../../../plate/src/index';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

it('serialize link to html with attributes', () => {
  const plugins = [createLinkPlugin()];

  expect(
    serializeHTMLFromNodes(
      createEditorPlugins({
        plugins,
        options: {
          a: {
            getNodeProps: () => ({
              target: '_blank',
              rel: 'noopener nofollow',
            }),
          },
        },
      }),
      {
        plugins,
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
      serializeHTMLFromNodes(createEditorPlugins({ plugins }), {
        plugins,
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
