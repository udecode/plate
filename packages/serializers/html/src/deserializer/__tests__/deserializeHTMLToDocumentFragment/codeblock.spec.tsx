/** @jsx jsx */

import { PlatePlugin } from '@udecode/plate-core';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

const html = `<blockquote>test \n code</blockquote>`;
const input1: PlatePlugin[] = [];
const input2 = getHtmlDocument(html).body.innerHTML;

const expectedOutput = [{ text: 'test \n code' }];

it('should have the break line', () => {
  const convertedDocumentFragment = deserializeHTMLToDocumentFragment(
    createEditorPlugins(),
    {
      plugins: input1,
      element: input2,
      stripWhitespace: false,
    }
  );

  expect(convertedDocumentFragment).toEqual(expectedOutput);
});
