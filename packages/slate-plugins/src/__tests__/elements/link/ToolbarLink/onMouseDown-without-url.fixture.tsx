/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { Editor } from 'slate';

export const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;
