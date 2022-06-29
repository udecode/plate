import { User } from '@xolvio/plate-comments';

export function determineAssigningVerb({
  assignedTo,
  userThatCanBeAssignedTo,
}: {
  assignedTo: User | null;
  userThatCanBeAssignedTo: User | null;
}): string {
  if (
    assignedTo &&
    userThatCanBeAssignedTo &&
    assignedTo.id !== userThatCanBeAssignedTo.id
  ) {
    return 'Reassign';
  }
  return 'Assign';
}
