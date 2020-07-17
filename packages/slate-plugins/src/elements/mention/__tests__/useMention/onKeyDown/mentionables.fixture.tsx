/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../__test-utils__/jsx';
import { MentionNodeData } from '../../../index';

export const editorWithMentionable = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

export const mentionables: MentionNodeData[] = [
  { value: 't2' },
  { value: 't22' },
  { value: 't222' },
];
