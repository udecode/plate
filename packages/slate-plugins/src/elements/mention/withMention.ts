import { withInline } from 'elements/withInline';
import { withVoid } from 'elements/withVoid';
import { Editor } from 'slate';
import { MENTION } from './types';

export const withMention = ({ typeMention = MENTION } = {}) => <
  T extends Editor
>(
  editor: T
) => {
  editor = withVoid([typeMention])(editor);
  editor = withInline([typeMention])(editor);

  return editor;
};
