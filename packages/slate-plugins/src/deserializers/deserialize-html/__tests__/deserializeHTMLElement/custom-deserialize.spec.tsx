/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { useImagePlugin } from '../../../../elements/image/useImagePlugin';
import { useLinkPlugin } from '../../../../elements/link/useLinkPlugin';
import { useParagraphPlugin } from '../../../../elements/paragraph/useParagraphPlugin';
import { useTablePlugin } from '../../../../elements/table/useTablePlugin';
import { useDeserializeBold } from '../../../../marks/bold/useDeserializeBold';
import { deserializeHTMLElement } from '../../../index';

const textTags = ['<b>strong</b>'];

const inlineTags = ['<a href="http://google.com" target="_blank">a</a>'];

const elementTags = [
  '<img alt="removed" src="https://i.imgur.com/removed.png" />',
  '<table><tr><th colspan="2" scope="row">header</th></tr><tr><td>cell 1</td><td>cell 2</td></tr></table>',
];

const html = `<html><body><p>${textTags.join('')}</p><p>${inlineTags.join(
  ''
)}</p>${elementTags.join('')}</body></html>`;

const input1 = [
  useImagePlugin({
    img: {
      deserialize: {
        attributes: ['alt'],
      },
    },
  }),
  useLinkPlugin({
    a: {
      deserialize: {
        node: (el) => ({
          type: 'a',
          url: el.getAttribute('href'),
          opener: el.getAttribute('target') === '_blank',
        }),
      },
    },
  }),
  useParagraphPlugin(),
  useTablePlugin({
    th: {
      deserialize: {
        node: (el) => ({ type: 'th', scope: el.getAttribute('scope') }),
      },
    },
  }),
  {
    deserialize: useDeserializeBold({
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
    <himg url="https://i.imgur.com/removed.png" attributes={{ alt: 'removed' }}>
      <htext />
    </himg>
    <htable>
      <htr>
        <hth scope="row" attributes={{ colspan: '2' }}>
          header
        </hth>
      </htr>
      <htr>
        <htd>cell 1</htd>
        <htd>cell 2</htd>
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
