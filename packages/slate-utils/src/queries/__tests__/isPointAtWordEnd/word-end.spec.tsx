/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';

import { isPointAtWordEnd } from '../../isPointAtWordEnd';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor /> test2
    </hp>
  </editor>
) as any as PlateEditor;

const at = Range.start(input.selection as Range);

const output = true;

it('should be', () => {
  expect(isPointAtWordEnd(input, { at })).toEqual(output);
});
