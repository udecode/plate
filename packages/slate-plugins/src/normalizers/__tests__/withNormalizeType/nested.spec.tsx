/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { options } from '../../../../../../stories/config/initialValues';
import { withTransforms } from '../../../common/transforms/index';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/index';
import { withNormalizeTypes } from '../../index';

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
        strictType: options.h1.type,
      },
      { path: [0, 1], type: ELEMENT_PARAGRAPH },
    ],
  })(withTransforms()(input as Editor));

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
