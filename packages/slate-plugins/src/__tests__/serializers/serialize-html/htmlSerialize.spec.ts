import { htmlSerialize } from 'serializers/serialize-html';
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
    htmlSerialize([BoldPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <strong>bold</strong> part.');
});

it('serialize italic to html', () => {
  expect(
    htmlSerialize([ItalicPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'italic', italic: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <em>italic</em> part.');
});

it('serialize highlight to html', () => {
  expect(
    htmlStringToDOMNode(
      htmlSerialize([HighlightPlugin()])([
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
      htmlSerialize([StrikethroughPlugin()])([
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
      htmlSerialize([CodePlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'code', code: true },
        { text: ' part.' },
      ])
    ).getElementsByTagName('code')[0].textContent
  ).toEqual('code');
});

it('serialize subscript to html', () => {
  expect(
    htmlSerialize([SubscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'subscripted', subscript: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <sub>subscripted</sub> part.');
});

it('serialize superscript to html', () => {
  expect(
    htmlSerialize([SuperscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'superscripted', superscript: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <sup>superscripted</sup> part.');
});

it('serialize underline to html', () => {
  expect(
    htmlSerialize([UnderlinePlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'underlined', underline: true },
      { text: ' part.' },
    ])
  ).toEqual('Some paragraph of text with <u>underlined</u> part.');
});

it('serialize list to html', () => {
  const render = htmlStringToDOMNode(
    htmlSerialize([ListPlugin()])([
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
    htmlSerialize([LinkPlugin()])([
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
      htmlSerialize([BlockquotePlugin()])([
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
    htmlSerialize([HeadingPlugin()])([
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
    htmlSerialize([ParagraphPlugin()])([
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
      htmlSerialize([ImagePlugin()])([
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
    htmlSerialize([TablePlugin()])([
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
