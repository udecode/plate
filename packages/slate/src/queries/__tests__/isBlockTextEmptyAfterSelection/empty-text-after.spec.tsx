/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { isBlockTextEmptyAfterSelection } from '../../isBlockTextEmptyAfterSelection';

jsxt;

const editor = createTEditor(
  (
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
  ) as any
);

const output = true;

it('should be', () => {
  editor.isInline = (element) => element.type === 'a';

  expect(isBlockTextEmptyAfterSelection(editor)).toEqual(output);
});
