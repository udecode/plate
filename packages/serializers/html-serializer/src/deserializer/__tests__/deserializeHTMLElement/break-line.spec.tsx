/** @jsx jsx */

import { PlatePlugin } from '@udecode/plate-core';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

jsx;

const editor = createEditorPlugins();

const html = `<html><body>test<br /></body></html>`;
const input1: PlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <htext>test{'\n'}</htext>
  </editor>
) as any;

it('should have the break line', () => {
  expect(
    deserializeHTMLElement(editor, {
      plugins: input1,
      element: input2,
    })
  ).toEqual(output.children);
});
