import { deserializeHTMLToDocumentFragment } from 'deserializers/deserialize-html';
import { serializeHTMLFromNodes } from 'serializers/serialize-html';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  HeadingPlugin,
  HighlightPlugin,
  ImagePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  ParagraphPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  UnderlinePlugin,
} from '../../..';

const htmlStringToDOMNode = (rawHtml: string) => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml.replace(/(\r\n|\n|\r|\t)/gm, '');
  return node;
};

it('serialize bold to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <strong>bold</strong> part.');
});

it('serialize italic to html', () => {
  expect(
    serializeHTMLFromNodes([ItalicPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'italic', italic: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <em>italic</em> part.');
});

it('serialize highlight to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([HighlightPlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'highlighted', highlight: true },
        { text: ' part.' },
      ])
    ).getElementsByTagName('mark')[0].textContent
  ).toEqual('highlighted');
});

it('serialize strikethrough to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([StrikethroughPlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'strikethrough', strikethrough: true },
        { text: ' part.' },
      ])
    ).getElementsByClassName('strikethrough')[0].textContent
  ).toEqual('strikethrough');
});

it('serialize code to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([CodePlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'code', code: true },
        { text: ' part.' },
      ])
    ).getElementsByTagName('code')[0].textContent
  ).toEqual('code');
});

it('serialize subscript to html', () => {
  expect(
    serializeHTMLFromNodes([SubscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'subscripted', subscript: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <sub>subscripted</sub> part.');
});

it('serialize superscript to html', () => {
  expect(
    serializeHTMLFromNodes([SuperscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'superscripted', superscript: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <sup>superscripted</sup> part.');
});

it('serialize underline to html', () => {
  expect(
    serializeHTMLFromNodes([UnderlinePlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'underlined', underline: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <u>underlined</u> part.');
});

it('serialize list to html', () => {
  const render = htmlStringToDOMNode(
    serializeHTMLFromNodes([ListPlugin()])([
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ text: 'Item one' }] },
          { type: 'li', children: [{ text: 'Item two' }] },
        ],
      },
    ])
  ).getElementsByTagName('ul')[0];
  expect(render.children.length).toEqual(2);
  expect(render.children[0].outerHTML).toEqual('<li>Item one</li>');
  expect(render.children[1].outerHTML).toEqual('<li>Item two</li>');
});

it('serialize link to html', () => {
  expect(
    serializeHTMLFromNodes([LinkPlugin()])([
      { text: 'Some paragraph of text with ' },
      {
        type: 'a',
        url: 'https://theuselessweb.com/',
        children: [{ text: 'link' }],
      },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <a href="https://theuselessweb.com/">link</a> part.'
  );
});

it('serialize blockquote to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([BlockquotePlugin()])([
        {
          type: 'blockquote',
          children: [{ text: 'Blockquoted text here...' }],
        },
      ])
    ).getElementsByTagName('blockquote')[0].textContent
  ).toEqual('Blockquoted text here...');
});

it('serialize headings to html', () => {
  const render = htmlStringToDOMNode(
    serializeHTMLFromNodes([HeadingPlugin()])([
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
    ])
  );
  expect(render.getElementsByTagName('h1')[0].textContent).toEqual('Heading 1');
  expect(render.getElementsByTagName('h2')[0].textContent).toEqual('Heading 2');
  expect(render.getElementsByTagName('h3')[0].textContent).toEqual('Heading 3');
});

it('serialize paragraph to html', () => {
  expect(
    serializeHTMLFromNodes([ParagraphPlugin()])([
      {
        type: 'p',
        children: [{ text: 'Some random paragraph here...' }],
      },
    ])
  ).toEqual('<p>Some random paragraph here...</p>');
});

it('serialize image to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([ImagePlugin()])([
        {
          type: 'img',
          url:
            'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
          children: [],
        },
      ])
    ).getElementsByTagName('img')[0].src
  ).toEqual('https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg');
});

it('serialize table to html', () => {
  const render = htmlStringToDOMNode(
    serializeHTMLFromNodes([TablePlugin()])([
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
        ],
      },
    ])
  ).getElementsByTagName('table');
  expect(
    render.item(0)?.children[0].children[0].children[0].textContent
  ).toEqual('Foo');
  expect(
    render.item(0)?.children[0].children[0].children[1].textContent
  ).toEqual('Bar');
});

it('serialize complex example list with paragraphs to html', () => {
  const render = htmlStringToDOMNode(
    serializeHTMLFromNodes([
      ItalicPlugin(),
      BoldPlugin(),
      ParagraphPlugin(),
      ListPlugin(),
    ])([
      {
        type: 'p',
        children: [
          {
            text: 'Some paragraph that contains, ',
          },
          {
            text: 'italicized text',
            italic: true,
          },
          {
            text: ' and ',
          },
          {
            text: 'bolded text',
            bold: true,
          },
          {
            text: ' is first.',
          },
        ],
      },
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [
              {
                type: 'p',
                children: [
                  {
                    text: 'Item one in list',
                  },
                ],
              },
            ],
          },
          {
            type: 'li',
            children: [
              {
                type: 'p',
                children: [
                  {
                    text: 'Item two in list',
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  );
  expect(render.getElementsByTagName('p').length).toEqual(3);
  expect(render.getElementsByTagName('p')[0].outerHTML).toEqual(
    '<p>Some paragraph that contains, <em>italicized text</em> and <strong>bolded text</strong> is first.</p>'
  );
  expect(render.getElementsByTagName('ul').length).toEqual(1);
  expect(render.getElementsByTagName('li').length).toEqual(2);
  expect(render.getElementsByTagName('ul')[0].innerHTML).toEqual(
    '<li><p>Item one in list</p></li><li><p>Item two in list</p></li>'
  );
});

it('serialize complex example with no type on top level node to html', () => {
  const render = serializeHTMLFromNodes([
    ItalicPlugin(),
    BoldPlugin(),
    ParagraphPlugin(),
    ListPlugin(),
  ])([
    {
      children: [
        {
          type: 'p',
          children: [
            {
              text: 'Some paragraph that contains, ',
            },
            {
              text: 'italicized text',
              italic: true,
            },
            {
              text: ' and ',
            },
            {
              text: 'bolded text',
              bold: true,
            },
            {
              text: ' is first.',
            },
          ],
        },
      ],
    },
  ]);
  expect(render).toEqual(
    '<div><p>Some paragraph that contains, <em>italicized text</em> and <strong>bolded text</strong> is first.</p></div>'
  );
});

it('serialize complex example with multiple no types on top level node to html', () => {
  const render = serializeHTMLFromNodes([
    ItalicPlugin(),
    BoldPlugin(),
    ParagraphPlugin(),
    ListPlugin(),
  ])([
    {
      children: [
        {
          type: 'p',
          children: [
            {
              text: 'Some paragraph that contains, ',
            },
            {
              text: 'italicized text',
              italic: true,
            },
            {
              text: ' and ',
            },
            {
              text: 'bolded text',
              bold: true,
            },
            {
              text: ' is first.',
            },
          ],
        },
      ],
    },
    {
      children: [{ text: 'FOO', bold: true }],
    },
  ]);
  expect(render).toEqual(
    '<div><p>Some paragraph that contains, <em>italicized text</em> and <strong>bolded text</strong> is first.</p></div><div><strong>FOO</strong></div>'
  );
});

it('serializes with edge case where input is non-rich text', () => {
  const input = htmlStringToDOMNode('Some non-rich text here.');
  const output = 'Some non-rich text here.';
  expect(
    serializeHTMLFromNodes([])(deserializeHTMLToDocumentFragment([])(input))
  ).toEqual(output);
});

it('serializes with edge case where input is text element', () => {
  const input = [{ text: 'Test just text.' }];
  const output = 'Test just text.';
  expect(serializeHTMLFromNodes([])(input)).toEqual(output);
});

it('serialize bold and italic together to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin(), ItalicPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true, italic: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <em><strong>bold</strong></em> part.');
});

it('serialize bold and superscript together to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin(), SuperscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true, superscript: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <sup><strong>bold</strong></sup> part.'
  );
});

it('serialize bold italic and underline together to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin(), ItalicPlugin(), UnderlinePlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true, italic: true, underline: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <u><em><strong>bold</strong></em></u> part.'
  );
});
