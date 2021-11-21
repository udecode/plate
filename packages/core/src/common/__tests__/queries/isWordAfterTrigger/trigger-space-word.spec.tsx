/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { PlateEditor } from '../../../../types/PlateEditor';
import { isWordAfterTrigger } from '../../../queries/index';

jsx;

const input = ((
  <editor>
    <hp>
      @ test
      <cursor /> test2
    </hp>
  </editor>
) as any) as PlateEditor;

const at = Range.start(input.selection as Range);

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' }).match).toBeNull();
});
