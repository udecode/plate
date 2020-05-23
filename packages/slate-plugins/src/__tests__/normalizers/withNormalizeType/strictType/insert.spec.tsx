/** @jsx jsx */

import { nodeTypes } from '__fixtures__/initialValues.fixtures';
import { jsx } from '__test-utils__/jsx';
import { withTransforms } from 'common/transforms';
import { withNormalizeTypes } from 'normalizers';
import { Editor } from 'slate';

const input = (
  <editor>
    <hh1>test</hh1>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>test</hh1>
    <hh2>
      <htext />
    </hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [{ path: [1], strictType: nodeTypes.typeH2 }],
  })(withTransforms()(input as Editor));

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
