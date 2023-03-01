/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { isWordAfterTrigger } from '../../../../../slate-utils/src/queries';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      @pré
      <cursor /> test2
    </hp>
  </editor>
) as any) as PlateEditor;

const at = Range.start(input.selection as Range);

const output = 'pré';

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' }).match?.[1]).toBe(
    output
  );
});
