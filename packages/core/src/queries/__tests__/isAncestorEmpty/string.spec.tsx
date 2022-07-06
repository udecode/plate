/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { isAncestorEmpty } from '../../index';

jsx;

const input = ((
  <hp>
    test
    <cursor />
  </hp>
) as any) as PlateEditor;

const output = false;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
