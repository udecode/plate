/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';

export const input = ((
  <editor>
    <hTodoList checked={false}>
      test
      <cursor />
    </hTodoList>
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hTodoList checked>
      test
      <cursor />
    </hTodoList>
  </editor>
) as any;
