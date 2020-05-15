/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { toggleMark } from 'mark/transforms';
import { MARK_BOLD } from 'marks/bold';

const input = (
  <editor>
    <p>test</p>
    <selection>
      <anchor path={[0, 0]} offset={3} />
      <focus path={[0, 0]} offset={4} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <p>
      tes
      <htext bold>t</htext>
      <cursor />
    </p>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, MARK_BOLD);
  expect(input.children).toEqual(output.children);
});
