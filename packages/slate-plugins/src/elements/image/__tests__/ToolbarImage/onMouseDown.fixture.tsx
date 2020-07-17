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
    <hp>test</hp>
    <himg url="https://i.imgur.com/removed.png">
      <cursor />
    </himg>
  </editor>
) as any;
