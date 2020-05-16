/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { ReactEditor } from 'slate-react';
import { isSelecting } from 'components/queries';

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
  jest.spyOn(ReactEditor, 'isFocused').mockImplementation(() => true);
  expect(isSelecting(input)).toEqual(output);
});
