import { Thread, User } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { OnReOpenThread, OnResolveThread, RetrieveUser } from '../../types';

export interface AssignedToHeaderStyleProps extends AssignedToHeaderProps {
  isAssignedToLoggedInUser?: boolean;
}

export interface AssignedToHeaderStyles {
  avatar: CSSProp;
  assignedTo: CSSProp;
  assignedToLabel: CSSProp;
  assignedToDisplayName: CSSProp;
  done: CSSProp;
}

export interface AssignedToHeaderProps
  extends StyledProps<AssignedToHeaderStyles> {
  thread: Thread;
  assignedTo: User;
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  retrieveUser: RetrieveUser;
  onResolveThread: OnResolveThread;
  onReOpenThread: OnReOpenThread;
}
