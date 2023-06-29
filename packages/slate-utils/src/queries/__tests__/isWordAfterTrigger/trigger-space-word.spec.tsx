/** @jsx jsx */

import { isWordAfterTrigger } from '@/packages/slate-utils/src/queries/isWordAfterTrigger';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';

jsx;

const input = (
  <editor>
    <hp>
      @ test
      <cursor /> test2
    </hp>
  </editor>
) as any as PlateEditor;

const at = Range.start(input.selection as Range);

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' }).match).toBeNull();
});
