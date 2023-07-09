/** @jsx jsx */

import { isAncestorEmpty } from '@/packages/slate-utils/src/queries/index';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <hp>
    test
    <cursor />
  </hp>
) as any as PlateEditor;

const output = false;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
