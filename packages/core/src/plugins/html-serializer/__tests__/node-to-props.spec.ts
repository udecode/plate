import {
  createImagePlugin,
  createLinkPlugin,
} from '../../../../../plate/src/index';
import { createPlateUIEditor } from '../../../../../ui/plate/src/utils/createPlateUIEditor';
import { serializeHtml } from '../serializeHtml';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

const plugins = [
  createLinkPlugin({
    props: ({ element }) =>
      /^https?:\/\/slatejs.org\/?/.test((element as any).url)
        ? {}
        : { target: '_blank' },
  }),
  createImagePlugin({
    props: ({ element }) => ({
      width: (element as any).url.split('/').pop(),
      alt: (element as any).attributes?.alt,
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
          type: 'a',
          url: 'https://theuselessweb.com/',
          children: [{ text: 'link' }],
        },
        { text: ' and an internal ' },
        {
          type: 'a',
          url: 'https://slatejs.org/',
          children: [{ text: 'link' }],
        },
        { text: '.' },
      ],
    })
  ).toBe(
    'An external <a href="https://theuselessweb.com/" class="slate-a" target="_blank">link</a> and an internal <a href="https://slatejs.org/" class="slate-a">link</a>.'
  );
});

it('serialize image with alt to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            type: 'img',
            url: 'https://via.placeholder.com/300',
            attributes: { alt: 'Placeholder' },
            children: [],
          },
        ],
      })
    ).getElementsByTagName('img')[0].outerHTML
  ).toEqual(
    '<img class="slate-ImageElement-img" src="https://via.placeholder.com/300" alt="Placeholder">'
  );
});
