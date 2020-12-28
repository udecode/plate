/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core/src';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { deserializeHTMLElement } from '../../../index';

const html = `<html><body>test<pre /></body></html>`;
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <htext>test</htext>
  </editor>
) as any;

it('should ignore pre', () => {
  expect(
    deserializeHTMLElement({
      plugins: input1,
      element: input2,
    })
  ).toEqual(output.children);
});
