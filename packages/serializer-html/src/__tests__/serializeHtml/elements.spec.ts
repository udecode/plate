import { createAlignPlugin } from '@/packages/alignment/src/index';
import { createBlockquotePlugin } from '@/packages/block-quote/src/index';
import { createHeadingPlugin } from '@/packages/heading/src/index';
import { createLinkPlugin } from '@/packages/link/src/index';
import { createListPlugin } from '@/packages/list/src/index';
import {
  ELEMENT_PARAGRAPH,
  createParagraphPlugin,
} from '@/packages/paragraph/src/index';
import { serializeHtml } from '@/packages/serializer-html/src/index';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@/packages/table/src/index';
import { createPlateUIEditor } from '@/plate/create-plate-ui-editor';
import { createTablePlugin } from '@udecode/plate';
import { htmlStringToDOMNode } from '@udecode/plate-common';
import { createImagePlugin } from '@udecode/plate-media';

import { TableCellElement } from '@/registry/default/plate-ui/table-cell-element';
import { TableElement } from '@/registry/default/plate-ui/table-element';
import { TableRowElement } from '@/registry/default/plate-ui/table-row-element';

it('serialize list to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createListPlugin()],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
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
  ).querySelectorAll('ul')[0];
  expect(render.children.length).toEqual(2);
  expect(render.children[0].outerHTML).toEqual(
    '<li class="slate-li">Item one</li>'
  );
  expect(render.children[1].outerHTML).toEqual(
    '<li class="slate-li">Item two</li>'
  );
});

it('serialize link to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createLinkPlugin()],
  });

  expect(
    serializeHtml(editor, {
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
    'Some paragraph of text with <a class="slate-a" href="https://theuselessweb.com/">link</a> part.'
  );
});

it('serialize blockquote to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createBlockquotePlugin()],
  });

  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            type: 'blockquote',
            children: [{ text: 'Blockquoted text\n here...' }],
          },
        ],
      })
    ).querySelectorAll('blockquote')[0].textContent
  ).toEqual('Blockquoted text here...');
});

it('serialize blockquote to html, without trimming whitespace', () => {
  const editor = createPlateUIEditor({
    plugins: [createBlockquotePlugin()],
  });

  const html = serializeHtml(editor, {
    nodes: [
      {
        type: 'blockquote',
        children: [{ text: 'Blockquoted text\nhere...' }],
      },
    ],
    stripWhitespace: false,
  });

  const node = htmlStringToDOMNode(html, false);
  expect(node.querySelectorAll('blockquote')[0].textContent).toEqual(
    'Blockquoted text\nhere...'
  );
});

it('serialize headings to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createHeadingPlugin()],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
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
  expect(render.querySelectorAll('h1')[0].textContent).toEqual('Heading 1');
  expect(render.querySelectorAll('h2')[0].textContent).toEqual('Heading 2');
  expect(render.querySelectorAll('h3')[0].textContent).toEqual('Heading 3');
});

it('serialize paragraph to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createParagraphPlugin()],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: 'p',
          children: [{ text: 'Some random paragraph here...' }],
        },
      ],
    })
  ).toMatch(
    new RegExp('<div class="slate-p">Some random paragraph here...</div>')
  );
});

it('serialize image to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createImagePlugin()],
  });

  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            type: 'img',
            url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
            children: [],
          },
        ],
      })
    ).querySelectorAll('img')[0].src
  ).toEqual('https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg');
});

it('serialize table to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createTablePlugin()],
    components: {
      [ELEMENT_TABLE]: TableElement,
      [ELEMENT_TR]: TableRowElement,
      [ELEMENT_TD]: TableCellElement,
      [ELEMENT_TH]: TableCellElement,
    },
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
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
  ).querySelectorAll('table')[0];
  expect(
    render.querySelector('table > tbody > tr:nth-child(1) > td:nth-child(1)')
      ?.textContent
  ).toEqual('Foo');
  expect(
    render.querySelector('table > tbody > tr:nth-child(1) > td:nth-child(2)')
      ?.textContent
  ).toEqual('Bar');
  expect(
    render.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(1)')
      ?.textContent
  ).toEqual('Span');
});

it('serialize align style to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createParagraphPlugin(), createAlignPlugin()],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          align: 'center',
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe(
    '<div class="slate-p slate-align-center" style="text-align:center">I am centered text!</div>'
  );
});

it('serialize align className to html', () => {
  const plugins = [
    createParagraphPlugin(),
    createAlignPlugin({
      props: { classNames: { center: 'slate-align-center' } },
    }),
  ];

  const editor = createPlateUIEditor({
    plugins,
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          align: 'center',
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe(
    '<div class="slate-p slate-align-center" style="text-align:center">I am centered text!</div>'
  );
});

it('serialize image and paragraph to html', () => {
  const plugins = [createParagraphPlugin(), createImagePlugin()];
  const render = serializeHtml(createPlateUIEditor({ plugins }), {
    nodes: [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'I am centered text!' }],
      },
      {
        type: 'img',
        url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
        children: [],
      },
    ],
  });
  expect(render).toContain(
    `<img src="https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg" alt="" draggable="true" />`
  );
});
