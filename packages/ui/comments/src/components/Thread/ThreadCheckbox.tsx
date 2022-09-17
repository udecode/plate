import React, { useCallback } from 'react';
import { MDCCheckbox } from '@material/checkbox';
import { User } from '../../types';
import { generateUserDisplayIdentifier, useLoggedInUser } from '../../utils';

export type ThreadCheckboxProps = {
  userThatCanBeAssignedTo: User | null;
  isAssigned: boolean;
  onToggleAssign: () => void;
  determineAssigningVerb: () => string;
  retrieveUser: () => User;
};

export const ThreadCheckbox = (props: ThreadCheckboxProps) => {
  const {
    determineAssigningVerb,
    isAssigned,
    onToggleAssign,
    retrieveUser,
    userThatCanBeAssignedTo,
  } = props;

  const loggedInUser = useLoggedInUser(retrieveUser);

  const initializeCheckbox = useCallback((checkbox) => {
    if (checkbox) {
      new MDCCheckbox(checkbox);
    }
  }, []);

  if (userThatCanBeAssignedTo) {
    return (
      <div className="mdc-form-field">
        <div
          ref={initializeCheckbox}
          className="mdc-checkbox mdc-checkbox--touch"
        >
          <input
            type="checkbox"
            className="mdc-checkbox__native-control"
            id="assign"
            checked={isAssigned}
            onChange={onToggleAssign}
          />
          <div className="mdc-checkbox__background">
            <svg className="mdc-checkbox__checkmark" viewBox="0 0 24 24">
              <path
                className="mdc-checkbox__checkmark-path"
                fill="none"
                d="M1.73,12.91 8.1,19.28 22.79,4.59"
              />
            </svg>
            <div className="mdc-checkbox__mixedmark" />
          </div>
          <div className="mdc-checkbox__ripple" />
        </div>
        <label htmlFor="assign">
          {userThatCanBeAssignedTo
            ? `${determineAssigningVerb()} to ${generateUserDisplayIdentifier({
                user: userThatCanBeAssignedTo,
                isLoggedInUser: userThatCanBeAssignedTo.id === loggedInUser?.id,
              })}`
            : `${determineAssigningVerb()}`}
        </label>
      </div>
    );
  }

  return null;
};
