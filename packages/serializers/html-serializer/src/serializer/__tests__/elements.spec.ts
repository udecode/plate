import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/defaults';
import {
  createAlignPlugin,
  createBlockquotePlugin,
  createHeadingPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createParagraphPlugin,
  createTablePlugin,
} from '../../../../../plate/src/index';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

const editor = createEditorPlugins({});

it('serialize list to html', () => {
  const render = htmlStringToDOMNode(
    serializeHTMLFromNodes(editor, {
      plugins: [createListPlugin()],
      nodes: [
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Item one' }] },
            { type: 'li', children: [{ text: 'Item two' }] },
          ],
        },
      ],
    })
  ).getElementsByTagName('ul')[0];
  expect(render.children.length).toEqual(2);
  expect(render.children[0].outerHTML).toEqual(
    '<li class="slate-li">Item one</li>'
  );
  expect(render.children[1].outerHTML).toEqual(
    '<li class="slate-li">Item two</li>'
  );
});

it('serialize link to html', () => {
  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [createLinkPlugin()],
      nodes: [
        { text: 'Some paragraph of text with ' },
        {
          type: 'a',
          url: 'https://theuselessweb.com/',
          children: [{ text: 'link' }],
        },
        { text: ' part.' },
      ],
    })
  ).toBe(
    'Some paragraph of text with <a href="https://theuselessweb.com/" class="slate-a">link</a> part.'
  );
});

it('serialize blockquote to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes(editor, {
        plugins: [createBlockquotePlugin()],
        nodes: [
          {
            type: 'blockquote',
            children: [{ text: 'Blockquoted text\n here...' }],
          },
        ],
      })
    ).getElementsByTagName('blockquote')[0].textContent
  ).toEqual('Blockquoted text here...');
});

it('serialize blockquote to html, without trimming whitespace', () => {
  const html = serializeHTMLFromNodes(editor, {
    plugins: [createBlockquotePlugin()],
    nodes: [
      {
        type: 'blockquote',
        children: [{ text: 'Blockquoted text\nhere...' }],
      },
    ],
    stripWhitespace: false,
  });

  const node = htmlStringToDOMNode(html, false);
  expect(node.getElementsByTagName('blockquote')[0].textContent).toEqual(
    'Blockquoted text\nhere...'
  );
});

it('serialize headings to html', () => {
  const render = htmlStringToDOMNode(
    serializeHTMLFromNodes(editor, {
      plugins: [createHeadingPlugin()],
      nodes: [
        {
          type: 'h1',
          children: [{ text: 'Heading 1' }],
        },
        {
          type: 'h2',
          children: [{ text: 'Heading 2' }],
        },
        {
          type: 'h3',
          children: [{ text: 'Heading 3' }],
        },
      ],
    })
  );
  expect(render.getElementsByTagName('h1')[0].textContent).toEqual('Heading 1');
  expect(render.getElementsByTagName('h2')[0].textContent).toEqual('Heading 2');
  expect(render.getElementsByTagName('h3')[0].textContent).toEqual('Heading 3');
});

it('serialize paragraph to html', () => {
  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [createParagraphPlugin()],
      nodes: [
        {
          type: 'p',
          children: [{ text: 'Some random paragraph here...' }],
        },
      ],
    })
  ).toMatch(new RegExp('<p class="slate-p">Some random paragraph here...</p>'));
});

it('serialize image to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes(editor, {
        plugins: [createImagePlugin()],
        nodes: [
          {
            type: 'img',
            url:
              'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
            children: [],
          },
        ],
      })
    ).getElementsByTagName('img')[0].src
  ).toEqual('https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg');
});

it('serialize table to html', () => {
  const render = htmlStringToDOMNode(
    serializeHTMLFromNodes(editor, {
      plugins: [createTablePlugin()],
      nodes: [
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: [
                { type: 'td', children: [{ text: 'Foo' }] },
                { type: 'td', children: [{ text: 'Bar' }] },
              ],
            },
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  attributes: { colspan: '2' },
                  children: [{ text: 'Span' }],
                },
              ],
            },
          ],
        },
      ],
    })
  ).getElementsByTagName('table')[0];
  expect(render.children[0].children[0].children[0].textContent).toEqual('Foo');
  expect(render.children[0].children[0].children[1].textContent).toEqual('Bar');
  expect(render.children[0]?.children[1].children[0].outerHTML).toEqual(
    '<td class="slate-td" colspan="2">Span</td>'
  );
});

it('serialize align style to html', () => {
  const plugins = [createParagraphPlugin(), createAlignPlugin()];

  expect(
    serializeHTMLFromNodes(createEditorPlugins({ editor, plugins }), {
      plugins,
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          align: 'center',
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe(
    '<p style="text-align:center" class="slate-p">I am centered text!</p>'
  );
});

it('serialize align className to html', () => {
  const plugins = [
    createParagraphPlugin(),
    createAlignPlugin({ classNames: { center: 'slate-align-center' } }),
  ];

  expect(
    serializeHTMLFromNodes(createEditorPlugins({ editor, plugins }), {
      plugins,
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          align: 'center',
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<p class="slate-p slate-align-center">I am centered text!</p>');
});
