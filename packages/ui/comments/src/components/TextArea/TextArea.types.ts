import { Dispatch, SetStateAction } from 'react';
import { Thread as ThreadModel } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { FetchContacts } from '../../types';

export interface TextAreaStyleProps extends TextAreaProps {}

export interface TextAreaStyles {
  avatar: CSSProp;
  assignedTo: CSSProp;
  assignedToLabel: CSSProp;
  assignedToDisplayName: CSSProp;
  done: CSSProp;
}

export interface TextAreaProps extends StyledProps<TextAreaStyles> {
  value: string;
  onChange: (value: string) => void;
  thread: ThreadModel;
  fetchContacts: FetchContacts;
  haveContactsBeenClosed: boolean;
  setHaveContactsBeenClosed: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void;
}
