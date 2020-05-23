import { htmlSerialize } from 'serializers/serialize-html';
import {
  BoldPlugin,
  HighlightPlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
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
