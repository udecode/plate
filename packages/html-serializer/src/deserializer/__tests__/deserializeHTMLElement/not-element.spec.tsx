/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { SlatePlugin } from '../../../../../core/src/types/SlatePlugin/SlatePlugin';
import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

const html = `<html><body>test<!-- You will not be able to see this text. --></body></html>`;
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <htext>test</htext>
  </editor>
) as any;

it('should not have the comment node', () => {
  expect(
    deserializeHTMLElement(createEditorPlugins(), {
      plugins: input1,
      element: input2,
    })
  ).toEqual(output.children);
});
