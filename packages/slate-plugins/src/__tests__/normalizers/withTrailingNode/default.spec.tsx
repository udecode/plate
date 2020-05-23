/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withTransforms } from 'common/transforms';
import { withTrailingNode } from 'normalizers/withTrailingNode';
import { Editor } from 'slate';

const input = (
  <editor>
    <hh1>
      <hp>test</hp>
    </hh1>
    <hh1>
      <hp>test2</hp>
    </hh1>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>
      <hp>test</hp>
    </hh1>
    <hh1>
      <hp>test2</hp>
    </hh1>
  </editor>
) as any;

it('should be', () => {
  const editor = withTrailingNode()(withTransforms()(input as Editor));

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
