/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeMarks } from 'deserializers/deserialize-html/utils';
import { ParagraphPlugin } from 'elements/paragraph';
import { BoldPlugin } from 'marks/bold';
import { ItalicPlugin } from 'marks/italic';

const input = {
  plugins: [ParagraphPlugin(), BoldPlugin(), ItalicPlugin()],
  el: document.createElement('strong'),
  children: [
    <li>
      <p>test</p>test
    </li>,
    null,
  ],
};

const output = (
  <fragment>
    <li>
      <p>
        <htext bold>test</htext>
      </p>
      <htext bold>test</htext>
    </li>
  </fragment>
);

it('should be', () => {
  expect(deserializeMarks(input as any)).toEqual(output);
});
