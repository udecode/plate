import { CSSProp, StyledProps } from 'styled-components';
import { Thread, useLoggedInUser, User } from '../utils';

export type AssignedToHeaderStyleProps = {
  isAssignedToLoggedInUser?: boolean;
} & AssignedToHeaderProps;

export type AssignedToHeaderStyles = {
  avatar: CSSProp;
  assignedTo: CSSProp;
  assignedToLabel: CSSProp;
  assignedToDisplayName: CSSProp;
  done: CSSProp;
};

export type AssignedToHeaderProps = {
  thread: Thread;
  assignedTo: User;
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  retrieveUser: () => User;
  onResolveThread: () => void;
  onReOpenThread: () => void;
} & StyledProps<AssignedToHeaderStyles>;

export const useAssignedToHeader = (props: AssignedToHeaderProps) => {
  const {
    assignedTo,
    onReOpenThread,
    onResolveThread,
    retrieveUser,
    showReOpenThreadButton,
    showResolveThreadButton,
    thread,
  } = props;

  const loggedInUser = useLoggedInUser(retrieveUser);
  const isAssignedToLoggedInUser = loggedInUser.id === assignedTo.id;
  return {
    assignedTo,
    isAssignedToLoggedInUser,
    onReOpenThread,
    onResolveThread,
    showReOpenThreadButton,
    showResolveThreadButton,
    thread,
  } as const;
};
