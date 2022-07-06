/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { getRangeFromBlockStart } from '../../index';

jsx;

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
