/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { ParagraphPlugin } from '../../../../elements/paragraph/index';
import { BoldPlugin } from '../../../../marks/bold/index';
import { ItalicPlugin } from '../../../../marks/italic/index';
import { deserializeHTMLToMarks } from '../../utils/index';

const input = {
  plugins: [ParagraphPlugin(), BoldPlugin(), ItalicPlugin()],
  element: document.createElement('strong'),
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
