import { htmlSerialize } from 'serializers/serialize-html';
import {
  BoldPlugin,
  HighlightPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  CodePlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
  LinkPlugin,
  ListPlugin,
  BlockquotePlugin,
} from '../../..';

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
    htmlSerialize([HighlightPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'highlighted', highlight: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <span class="sc-fznWqX jhjZFC">highlighted</span> part.'
    // THIS SHOULD LOOK LIKE THIS:
    // 'Some paragraph of text with <mark>highlighted</mark> part.'
  );
});

it('serialize strikethrough to html', () => {
  expect(
    htmlSerialize([StrikethroughPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'strikethrough', strikethrough: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <span class="sc-fzqARJ jiBykp">strikethrough</span> part.'
    // We need to add explicit class to this span 'strikethrough'
  );
});

it.skip('serialize code to html', () => {
  expect(
    htmlSerialize([CodePlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'code', code: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <code>code</code> part.'
  );
});

it('serialize subscript to html', () => {
  expect(
    htmlSerialize([SubscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'subscripted', SUBSCRIPT: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <sub>subscripted</sub> part.'
  );
});

it('serialize superscript to html', () => {
  expect(
    htmlSerialize([SuperscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'superscripted', SUPERSCRIPT: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <sup>superscripted</sup> part.'
  );
});

it('serialize underline to html', () => {
  expect(
    htmlSerialize([UnderlinePlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'underlined', underline: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <u>underlined</u> part.'
  );
});

it('serialize list to html', () => {
  expect(
    htmlSerialize([ListPlugin()])([
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ text: 'Item one' }] },
          { type: 'li', children: [{ text: 'Item two' }] },
        ],
      },
    ])
  ).toEqual(
    '<ul class="sc-fzqNJr hcIsGR"><li>Item one</li><li>Item two</li></ul>'
    // ARBITRARY CLASS HERE
  );
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
    htmlSerialize([BlockquotePlugin()])([
      {
        type: 'blockquote',
        children: [{ text: 'Blockquoted text here...' }],
      },
    ])
  ).toEqual(
    '<blockquote class="sc-AxmLO jtdIXC">Blockquoted text here...</blockquote>'
    // ARBITRARY CLASS HERE
  );
});
