import { useLoggedInUser } from '../../utils';
import { AssignedToHeaderProps } from './AssignedToHeader.types';

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
