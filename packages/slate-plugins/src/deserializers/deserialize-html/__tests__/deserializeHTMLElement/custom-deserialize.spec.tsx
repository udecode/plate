/** @jsx jsx */

import { getHtmlDocument } from '../../../../__test-utils__/getHtmlDocument';
import { jsx } from '../../../../__test-utils__/jsx';
import { ImagePlugin } from '../../../../elements/image/index';
import { LinkPlugin } from '../../../../elements/link/index';
import { ParagraphPlugin } from '../../../../elements/paragraph/index';
import { TablePlugin } from '../../../../elements/table/index';
import { deserializeBold } from '../../../../marks/bold/deserializeBold';
import { deserializeHTMLElement } from '../../../index';

const textTags = ['<b>strong</b>'];

const inlineTags = ['<a href="http://google.com" target="_blank">a</a>'];

const elementTags = [
  '<img alt="removed" src="https://i.imgur.com/removed.png" />',
  '<table><tr><td colspan="2">table</td></tr></table>',
];

const html = `<html><body><p>${textTags.join('')}</p><p>${inlineTags.join(
  ''
)}</p>${elementTags.join('')}</body></html>`;

const input1 = [
  ImagePlugin({
    img: {
      deserialize: {
        node: (el) => ({
          type: 'img',
          url: el.getAttribute('src'),
          alt: el.getAttribute('alt'),
        }),
      },
    },
  }),
  LinkPlugin({
    link: {
      deserialize: {
        node: (el) => ({
          type: 'a',
          url: el.getAttribute('href'),
          opener: el.getAttribute('target') === '_blank',
        }),
      },
    },
  }),
  ParagraphPlugin(),
  TablePlugin({
    td: {
      deserialize: {
        node: (el) => ({ type: 'td', colSpan: el.getAttribute('colspan') }),
      },
    },
  }),
  {
    deserialize: deserializeBold({
      bold: { deserialize: { rules: [{ nodeNames: ['B'] }] } },
    }),
  },
];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <hp>
      <htext bold>strong</htext>
    </hp>
    <hp>
      <ha opener url="http://google.com">
        a
      </ha>
    </hp>
    <himg alt="removed" url="https://i.imgur.com/removed.png">
      <htext />
    </himg>
    <htable>
      <htr>
        <htd colSpan="2">table</htd>
      </htr>
    </htable>
  </editor>
) as any;

it('should be', () => {
  expect(
    deserializeHTMLElement({
      plugins: input1,
      element: input2,
    })
  ).toEqual(output.children);
});
