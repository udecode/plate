/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { PlatePlugin } from '@udecode/plate-core';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createImagePlugin } from '../../../../../../elements/image/src/createImagePlugin';
import { createLinkPlugin } from '../../../../../../elements/link/src/createLinkPlugin';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createTablePlugin } from '../../../../../../elements/table/src/createTablePlugin';
import { createBoldPlugin } from '../../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

jsx;

const textTags = ['<b>strong</b>'];

const inlineTags = ['<a href="http://google.com" target="_blank">a</a>'];

const elementTags = [
  '<img alt="removed" src="https://i.imgur.com/removed.png" />',
  '<table><tr><th colspan="2" scope="row">header</th></tr><tr><td>cell 1</td><td>cell 2</td></tr></table>',
];

const html = `<html><body><p>${textTags.join('')}</p><p>${inlineTags.join(
  ''
)}</p>${elementTags.join('')}</body></html>`;

const editor = createEditorPlugins({
  options: {
    img: {
      deserialize: {
        attributeNames: ['alt'],
      },
    },
    a: {
      deserialize: {
        getNode: (el) => ({
          type: 'a',
          url: el.getAttribute('href'),
          opener: el.getAttribute('target') === '_blank',
        }),
      },
    },
    th: {
      deserialize: {
        getNode: (el) => ({ type: 'th', scope: el.getAttribute('scope') }),
      },
    },
    bold: { deserialize: { rules: [{ nodeNames: ['B'] }] } },
  },
});

const plugins: PlatePlugin[] = [
  createImagePlugin(),
  createLinkPlugin(),
  createParagraphPlugin(),
  createTablePlugin(),
  createBoldPlugin(),
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
    deserializeHTMLElement(editor, {
      plugins,
      element: input2,
    })
  ).toEqual(output.children);
});
