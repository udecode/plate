/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withTrailingBlock } from '../getTrailingBlockPlugin';

jsx;

const input = (
  <editor>
    <hh1>test</hh1>
    <hh1>test2</hh1>
    <hp>p</hp>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>test</hh1>
    <hh1>test2</hh1>
    <hp>p</hp>
  </editor>
) as any;

it('should be', () => {
  const editor = withTrailingBlock()(input as Editor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
