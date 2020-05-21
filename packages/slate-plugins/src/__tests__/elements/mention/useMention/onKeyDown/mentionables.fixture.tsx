/** @jsx jsx */
import { jsx } from '__test-utils__/jsx';
import { MentionableItem } from 'elements/mention';
import { Editor } from 'slate';

export const editorWithMentionable = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

export const mentionables: MentionableItem[] = [
  { value: 't2' },
  { value: 't22' },
  { value: 't222' },
];
