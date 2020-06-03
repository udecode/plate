/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeHTMLToMarks } from 'deserializers/deserialize-html/utils';
import { ParagraphPlugin } from 'elements/paragraph';
import { BoldPlugin } from 'marks/bold';
import { ItalicPlugin } from 'marks/italic';

const input = {
  plugins: [ParagraphPlugin(), BoldPlugin(), ItalicPlugin()],
  el: document.createElement('strong'),
  children: [
    <hli>
      <hp>test</hp>test
    </hli>,
    null,
  ],
};

const output = (
  <fragment>
    <hli>
      <hp>
        <htext bold>test</htext>
      </hp>
      <htext bold>test</htext>
    </hli>
  </fragment>
);

it('should be', () => {
  expect(deserializeHTMLToMarks(input as any)).toEqual(output);
});
