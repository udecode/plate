/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { upsertAlign } from '../../transforms/upsertAlign';
import { ALIGN_CENTER } from '../../types';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hcenter>
      <hp>test</hp>
    </hcenter>
  </editor>
) as any) as Editor;

it('should align center', () => {
  upsertAlign(input, { type: ALIGN_CENTER });

  expect(input.children).toEqual(output.children);
});
