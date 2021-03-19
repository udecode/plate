/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { useParagraphPlugin } from '../../../../elements/paragraph/useParagraphPlugin';
import { useBoldPlugin } from '../../../../marks/bold/useBoldPlugin';
import { useItalicPlugin } from '../../../../marks/italic/useItalicPlugin';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

const input = {
  plugins: [useParagraphPlugin(), useBoldPlugin(), useItalicPlugin()],
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
