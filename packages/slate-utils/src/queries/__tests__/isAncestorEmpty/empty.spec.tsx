/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

import { isAncestorEmpty } from '@/slate-utils/src/queries/index';

jsx;

const input = (
  <hp>
    <cursor />
  </hp>
) as any as PlateEditor;

const output = true;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
