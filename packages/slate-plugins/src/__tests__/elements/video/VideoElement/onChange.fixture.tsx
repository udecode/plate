/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { Editor } from 'slate';

export const input = ((
  <editor>
    <hvideo url="test" />
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hvideo url="change">
      <cursor />
    </hvideo>
  </editor>
) as any;
