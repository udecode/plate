/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { PlatePlugin } from '../../../../../../core/src/types/PlatePlugin/PlatePlugin';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

const html = `<html><body><h1>test</h1></body></html>`;
const input1: PlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <htext>test</htext>
  </editor>
) as any;

it('should not deserialize the tags without plugins', () => {
  expect(
    deserializeHTMLElement(createEditorPlugins(), {
      plugins: input1,
      element: input2,
    })
  ).toEqual(output.children);
});
