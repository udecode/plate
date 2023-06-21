/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { TEditor } from '@udecode/slate';

import { isBlockTextEmptyAfterSelection } from '@/packages/slate-utils/src/queries/isBlockTextEmptyAfterSelection';

jsx;

const editor = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
      <htext />
    </hp>
  </editor>
) as any as TEditor;

const output = true;

it('should be', () => {
  editor.isInline = (element) => element.type === 'a';

  expect(isBlockTextEmptyAfterSelection(editor)).toEqual(output);
});
