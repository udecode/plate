/** @jsx jsx */

import { isSelectionExpanded } from '@/packages/slate-utils/src/queries/index';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <element>test</element>
    <selection>
      <anchor path={[0, 0]} offset={0} />
      <focus path={[0, 0]} offset={1} />
    </selection>
  </editor>
) as any;

const output = true;

it('should be', () => {
  expect(isSelectionExpanded(input)).toEqual(output);
});
