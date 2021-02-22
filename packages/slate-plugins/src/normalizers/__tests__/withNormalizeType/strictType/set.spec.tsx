/** @jsx jsx */

import { Editor } from 'slate';
import { options } from '../../../../../../../stories/config/initialValues';
import { jsx } from '../../../../__test-utils__/jsx';
import { withNormalizeTypes } from '../../../index';

const input = (
  <editor>
    <hh2>test</hh2>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>test</hh1>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [{ path: [0], strictType: options.h1.type }],
  })(input as Editor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
