import { withInline } from 'elements/withInline';
import { withVoid } from 'elements/withVoid';
import { Editor } from 'slate';
import { MENTION } from './types';

export const withMention = <T extends Editor>(editor: T) => {
  editor = withVoid([MENTION])(editor);
  editor = withInline([MENTION])(editor);

  return editor;
};
