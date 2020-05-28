/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { isSelectionExpanded } from 'common/queries';

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
