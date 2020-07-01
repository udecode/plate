/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';

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
      <ha url="https://i.imgur.com/removed.png">
        https://i.imgur.com/removed.png
      </ha>
      <cursor />
    </hp>
  </editor>
) as any;
