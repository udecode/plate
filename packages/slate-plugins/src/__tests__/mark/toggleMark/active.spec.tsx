/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { toggleMark } from 'mark/transforms';
import { MARK_BOLD } from 'marks/bold';

const input = (
  <editor>
    <p>
      tes
      <htext bold>t</htext>
    </p>
    <selection>
      <anchor path={[0, 1]} offset={0} />
      <focus path={[0, 1]} offset={1} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, MARK_BOLD);
  expect(input.children).toEqual(output.children);
});
