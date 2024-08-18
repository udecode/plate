import { AlignPlugin } from '@udecode/plate-alignment';
import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { htmlStringToDOMNode } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common';
import { HeadingPlugin } from '@udecode/plate-heading';
import { LinkPlugin } from '@udecode/plate-link';
import { ListPlugin } from '@udecode/plate-list';
import { ImagePlugin } from '@udecode/plate-media';
import { TablePlugin } from '@udecode/plate-table';

import { serializeHtml } from '../../react/serializeHtml';
import { createPlateUIEditor } from '../create-plate-ui-editor';

it('serialize list to html', () => {
  const editor = createPlateUIEditor({
    plugins: [ListPlugin],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          children: [
            { children: [{ text: 'Item one' }], type: 'li' },
            { children: [{ text: 'Item two' }], type: 'li' },
          ],
          type: 'ul',
        },
      ],
    })
  ).querySelectorAll('ul')[0];
  expect(render.children).toHaveLength(2);
  expect(render.children[0].outerHTML).toEqual(
    '<li class="slate-li">Item one</li>'
  );
  expect(render.children[1].outerHTML).toEqual(
    '<li class="slate-li">Item two</li>'
  );
});

it('serialize link to html', () => {
  const editor = createPlateUIEditor({
    plugins: [LinkPlugin],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        {
          children: [{ text: 'link' }],
          type: 'a',
          url: 'https://theuselessweb.com/',
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
    plugins: [BlockquotePlugin],
  });

  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            children: [{ text: 'Blockquoted text\n here...' }],
            type: 'blockquote',
          },
        ],
      })
    ).querySelectorAll('blockquote')[0]
  ).toHaveTextContent(`Blockquoted text here...`);
});

it('serialize blockquote to html, without trimming whitespace', () => {
  const editor = createPlateUIEditor({
    plugins: [BlockquotePlugin],
  });

  const html = serializeHtml(editor, {
    nodes: [
      {
        children: [{ text: 'Blockquoted text\nhere...' }],
        type: 'blockquote',
      },
    ],
    stripWhitespace: false,
  });

  const node = htmlStringToDOMNode(html);
  expect(node.querySelectorAll('blockquote')[0]).toHaveTextContent(
    'Blockquoted text here...'
  );
});

it('serialize headings to html', () => {
  const editor = createPlateUIEditor({
    plugins: [HeadingPlugin],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          children: [{ text: 'Heading 1' }],
          type: 'h1',
        },
        {
          children: [{ text: 'Heading 2' }],
          type: 'h2',
        },
        {
          children: [{ text: 'Heading 3' }],
          type: 'h3',
        },
      ],
    })
  );
  expect(render.querySelectorAll('h1')[0]).toHaveTextContent('Heading 1');
  expect(render.querySelectorAll('h2')[0]).toHaveTextContent('Heading 2');
  expect(render.querySelectorAll('h3')[0]).toHaveTextContent('Heading 3');
});

it('serialize paragraph to html', () => {
  const editor = createPlateUIEditor({
    plugins: [ParagraphPlugin],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          children: [{ text: 'Some random paragraph here...' }],
          type: 'p',
        },
      ],
    })
  ).toMatch(
    new RegExp('<div class="slate-p">Some random paragraph here...</div>')
  );
});

it('serialize image to html', () => {
  const editor = createPlateUIEditor({
    plugins: [ImagePlugin],
  });

  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            children: [],
            type: 'img',
            url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
          },
        ],
      })
    ).querySelectorAll('img')[0].src
  ).toEqual('https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg');
});

it('serialize table to html', () => {
  const editor = createPlateUIEditor({
    plugins: [TablePlugin],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          children: [
            {
              children: [
                { children: [{ text: 'Foo' }], type: 'td' },
                { children: [{ text: 'Bar' }], type: 'td' },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  attributes: { colspan: '2' },
                  children: [{ text: 'Span' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
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
    plugins: [ParagraphPlugin, AlignPlugin],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          align: 'center',
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
    })
  ).toBe(
    '<div class="slate-p slate-align-center" style="text-align: center;">I am centered text!</div>'
  );
});

it('serialize align className to html', () => {
  const plugins = [
    ParagraphPlugin,
    AlignPlugin.extend({
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
          align: 'center',
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
    })
  ).toBe(
    '<div class="slate-p slate-align-center" style="text-align: center;">I am centered text!</div>'
  );
});

it('serialize image and paragraph to html', () => {
  const plugins = [ParagraphPlugin, ImagePlugin];
  const render = serializeHtml(createPlateUIEditor({ plugins }), {
    nodes: [
      {
        children: [{ text: 'I am centered text!' }],
        type: ParagraphPlugin.key,
      },
      {
        children: [],
        type: 'img',
        url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
      },
    ],
  });
  expect(render).toContain(`<img`);
});
