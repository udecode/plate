import { Editor } from 'slate';
import { withInline, withVoid } from '../../element';
import { MENTION, WithMentionOptions } from './types';

export const withMention = ({
  typeMention = MENTION,
}: WithMentionOptions = {}) => <T extends Editor>(editor: T) => {
  editor = withVoid([typeMention])(editor);
  editor = withInline([typeMention])(editor);

  return editor;
};
