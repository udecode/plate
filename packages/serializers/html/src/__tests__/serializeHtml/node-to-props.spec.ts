import { htmlStringToDOMNode } from '@/packages/core/src/plugins/html-deserializer/utils/htmlStringToDOMNode';
import { createImagePlugin } from '@/packages/media/src/index';
import { createLinkPlugin } from '@/packages/nodes/link/src/index';
import { serializeHtml } from '@/packages/serializers/html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

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
          target: '_self',
          children: [{ text: 'link' }],
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
            type: 'img',
            url: 'https://via.placeholder.com/300',
            attributes: { alt: 'Placeholder' },
            children: [],
          },
        ],
      })
    ).querySelectorAll('img')[0].outerHTML
  ).toEqual(
    '<img src="https://via.placeholder.com/300" alt="Placeholder" draggable="true">'
  );
});
