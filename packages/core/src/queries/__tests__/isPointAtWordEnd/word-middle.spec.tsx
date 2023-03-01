/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { isPointAtWordEnd } from '../../../../../slate-utils/src/queries';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
      test2
    </hp>
  </editor>
) as any) as PlateEditor;

const at = Range.start(input.selection as Range);

const output = false;

it('should be', () => {
  expect(isPointAtWordEnd(input, { at })).toEqual(output);
});
