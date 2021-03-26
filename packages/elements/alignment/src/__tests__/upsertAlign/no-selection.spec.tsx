/** @jsx jsx */

jsx;
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { upsertAlign } from '../../transforms/upsertAlign';

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

it('should be', () => {
  upsertAlign(input, {});

  expect(input.children).toEqual(output.children);
});
