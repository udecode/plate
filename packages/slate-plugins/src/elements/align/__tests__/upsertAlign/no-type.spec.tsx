/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { upsertAlign } from '../../transforms/upsertAlign';

const input = ((
  <editor>
    <hcenter>
      <hp>
        test
        <cursor />
      </hp>
    </hcenter>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

it('should align center', () => {
  upsertAlign(input, {});

  expect(input.children).toEqual(output.children);
});
