/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
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
    <hp>test</hp>
    <himg url="https://i.imgur.com/removed.png">
      <cursor />
    </himg>
  </editor>
) as any;
