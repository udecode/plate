/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { isAncestorEmpty } from '../../../../../slate-utils/src/queries';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <hp>
    <cursor />
  </hp>
) as any) as PlateEditor;

const output = true;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
