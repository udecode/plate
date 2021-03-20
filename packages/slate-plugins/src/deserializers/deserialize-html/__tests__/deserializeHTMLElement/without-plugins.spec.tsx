/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core/src';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { createEditorPlugins } from '../../../../__fixtures__/editor.fixtures';
import { deserializeHTMLElement } from '../../../index';

const html = `<html><body><h1>test</h1></body></html>`;
const input1: SlatePlugin[] = [];
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
