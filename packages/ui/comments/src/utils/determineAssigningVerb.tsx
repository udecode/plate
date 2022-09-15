import { User } from '../types';

type DetermineAssigningVerbParams = {
  assignedTo: User | null;
  userThatCanBeAssignedTo: User | null;
};

export const determineAssigningVerb = (
  params: DetermineAssigningVerbParams
): string => {
  const { assignedTo, userThatCanBeAssignedTo } = params;
  if (
    assignedTo &&
    userThatCanBeAssignedTo &&
    assignedTo.id !== userThatCanBeAssignedTo.id
  ) {
    return 'Reassign';
  }
  return 'Assign';
};
