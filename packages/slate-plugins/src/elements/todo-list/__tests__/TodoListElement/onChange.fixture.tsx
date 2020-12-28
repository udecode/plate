/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';

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
