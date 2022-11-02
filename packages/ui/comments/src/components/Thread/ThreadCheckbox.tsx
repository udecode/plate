import React from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { User } from '@udecode/plate-comments';
import { generateUserDisplayIdentifier, useLoggedInUser } from '../../utils';

export type ThreadCheckboxProps = {
  userThatCanBeAssignedTo: User | null;
  isAssigned: boolean;
  onToggleAssign: () => void;
  determineAssigningVerb: () => string;
  retrieveUser: () => User;
};

export const useThreadCheckbox = (props: ThreadCheckboxProps) => {
  const {
    determineAssigningVerb,
    retrieveUser,
    userThatCanBeAssignedTo,
  } = props;

  const loggedInUser = useLoggedInUser(retrieveUser);

  const label = userThatCanBeAssignedTo
    ? `${determineAssigningVerb()} to ${generateUserDisplayIdentifier({
        user: userThatCanBeAssignedTo,
        isLoggedInUser: userThatCanBeAssignedTo.id === loggedInUser?.id,
      })}`
    : `${determineAssigningVerb()}`;

  return { ...props, label };
};

export const ThreadCheckbox = (props: ThreadCheckboxProps) => {
  const {
    userThatCanBeAssignedTo,
    label,
    onToggleAssign,
    isAssigned,
  } = useThreadCheckbox(props);

  if (userThatCanBeAssignedTo) {
    return (
      <FormGroup>
        <FormControlLabel
          label={label}
          control={<Checkbox value={isAssigned} onChange={onToggleAssign} />}
        />
      </FormGroup>
    );
  }

  return null;
};
