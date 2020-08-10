/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';

export const input = ((
  <editor>
    <hp>
      <ha url="https://i.imgur.com/removed.png">
        <cursor />
        https://i.imgur.com/removed.png
      </ha>
    </hp>
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hp>
      <ha url="https://i.imgur.com/changed.png">
        <cursor />
        https://i.imgur.com/removed.png
      </ha>
    </hp>
  </editor>
) as any;
