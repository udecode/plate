/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { upsertAlign } from '../../transforms/upsertAlign';

jsx;

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
