/** @jsx jsx */

import { nodeTypes } from '__fixtures__/initialValues.fixtures';
import { jsx } from '__test-utils__/jsx';
import { withTransforms } from 'common/transforms';
import { PARAGRAPH } from 'elements/paragraph';
import { withNormalizeTypes } from 'normalizers';
import { Editor } from 'slate';

const input = (
  <editor>
    <block />
  </editor>
) as any;

const output = (
  <editor>
    <block>
      <hh1>
        <htext />
      </hh1>
      <hp>
        <htext />
      </hp>
    </block>
  </editor>
) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [
      {
        path: [0, 0],
        strictType: nodeTypes.typeH1,
      },
      { path: [0, 1], type: PARAGRAPH },
    ],
  })(withTransforms()(input as Editor));

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
