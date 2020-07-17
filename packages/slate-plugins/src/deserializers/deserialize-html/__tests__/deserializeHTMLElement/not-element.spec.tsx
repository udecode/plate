/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core/src';
import { getHtmlDocument } from '../../../../__test-utils__/getHtmlDocument';
import { jsx } from '../../../../__test-utils__/jsx';
import { deserializeHTMLElement } from '../../../index';

const html = `<html><body>test<!-- You will not be able to see this text. --></body></html>`;
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <htext>test</htext>
  </editor>
) as any;

it('should not have the comment node', () => {
  expect(deserializeHTMLElement(input1)(input2)).toEqual(output.children);
});
