import { Thread } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { FetchContacts } from '../../types';

export interface ThreadCommentEditingStyleProps
  extends ThreadCommentEditingProps {}

export interface ThreadCommentEditingStyles {
  commentInput: CSSProp;
  buttons: CSSProp;
  commentButton: CSSProp;
  cancelButton: CSSProp;
}

export interface ThreadCommentEditingProps
  extends StyledProps<ThreadCommentEditingStyles> {
  defaultText: string;
  fetchContacts: FetchContacts;
  onCancel: () => void;
  onSave: (text: string) => void;
  thread: Thread;
}
