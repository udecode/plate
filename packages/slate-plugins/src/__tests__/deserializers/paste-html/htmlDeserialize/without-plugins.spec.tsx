/** @jsx jsx */

import { getHtmlDocument } from '__test-utils__/getHtmlDocument';
import { jsx } from '__test-utils__/jsx';
import { SlatePlugin } from 'common/types';
import { htmlDeserialize } from 'deserializers';

const html = `<html><body><h1>test</h1></body></html>`;
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <text>test</text>
  </editor>
) as any;

it('should not deserialize the tags without plugins', () => {
  expect(htmlDeserialize(input1)(input2)).toEqual(output.children);
});
