/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { isSelectionExpanded } from '../../isSelectionExpanded';

jsxt;

const input = (
  <editor>
    <element>test</element>
    <selection>
      <anchor offset={0} path={[0, 0]} />
      <focus offset={1} path={[0, 0]} />
    </selection>
  </editor>
) as any;

const output = true;

it('should be', () => {
  expect(isSelectionExpanded(input)).toEqual(output);
});
