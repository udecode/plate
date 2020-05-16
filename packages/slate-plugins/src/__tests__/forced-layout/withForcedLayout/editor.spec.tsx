/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withForcedLayout, withTransforms } from 'node';
import { Editor } from 'slate';

const input = (<editor />) as any;

const output = (
  <editor>
    <h1>
      <text />
    </h1>
    <p>
      <text />
    </p>
  </editor>
) as any;

it('should be', () => {
  const editor = withForcedLayout()(withTransforms()(input as Editor));

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
