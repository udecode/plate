/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { ParagraphPlugin } from '../../../../elements/paragraph/ParagraphPlugin';
import { BoldPlugin } from '../../../../marks/bold/BoldPlugin';
import { ItalicPlugin } from '../../../../marks/italic/ItalicPlugin';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

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
