import {
  AlignPlugin,
  BlockquotePlugin,
  HeadingPlugin,
  htmlStringToDOMNode,
  ImagePlugin,
  LinkPlugin,
  ListPlugin,
  ParagraphPlugin,
  TablePlugin,
} from '../../../index';
import { serializeHTMLFromNodes } from '../index';

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
  expect(render.children[0].outerHTML).toEqual(
    '<li class="slate-li">Item one</li>'
  );
  expect(render.children[1].outerHTML).toEqual(
    '<li class="slate-li">Item two</li>'
  );
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
  ).toBe(
    'Some paragraph of text with <a href="https://theuselessweb.com/" class="slate-link">link</a> part.'
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
  ).toMatch(new RegExp('<p class="slate-p">Some random paragraph here...</p>'));
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

it('serialize alignments to html', () => {
  expect(
    serializeHTMLFromNodes([AlignPlugin()])([
      { type: 'align_center', children: [{ text: 'I am centered text!' }] },
    ])
  ).toBe('<div class="slate-align-center">I am centered text!</div>');
});
