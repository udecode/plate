/** @jsx jsx */

import { getHtmlDocument } from '__test-utils__/getHtmlDocument';
import { jsx } from '__test-utils__/jsx';
import { htmlDeserialize } from 'deserializers';

const html = `<html><body><h1>test</h1></body></html>`;
export const input = {
  plugins: [],
  element: getHtmlDocument(html).body,
};

export const run = (value: any) => {
  return htmlDeserialize(value.plugins)(value.element);
};

export const output = (
  <editor>
    <text>test</text>
  </editor>
);
