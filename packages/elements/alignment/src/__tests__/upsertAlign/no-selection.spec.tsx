/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { upsertAlign } from '../../transforms/upsertAlign';

jsx;

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
