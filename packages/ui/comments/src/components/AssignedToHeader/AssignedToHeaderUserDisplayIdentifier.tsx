import { User } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { capitalize } from 'lodash';
import { generateUserDisplayIdentifier, useLoggedInUser } from '../../utils';

export type AssignedToHeaderUserDisplayIdentifierProps = {
  assignedTo: User;
  retrieveUser: () => User;
} & HTMLPropsAs<'div'>;

export const useAssignedToHeaderUserDisplayIdentifier = (
  props: AssignedToHeaderUserDisplayIdentifierProps
): HTMLPropsAs<'div'> => {
  const { retrieveUser, assignedTo } = props;
  const loggedInUser = useLoggedInUser(retrieveUser);
  const isAssignedToLoggedInUser = loggedInUser?.id === assignedTo.id;
  PlateAssignedToHeader;
  const text = capitalize(
    generateUserDisplayIdentifier({
      user: assignedTo,
      isLoggedInUser: isAssignedToLoggedInUser,
    })
  );
  return { ...props, children: text };
};

export const AssignedToHeaderUserDisplayIdentifier = createComponentAs<AssignedToHeaderUserDisplayIdentifierProps>(
  (props) => {
    const htmlProps = useAssignedToHeaderUserDisplayIdentifier(props);
    return createElementAs('div', htmlProps);
  }
);
