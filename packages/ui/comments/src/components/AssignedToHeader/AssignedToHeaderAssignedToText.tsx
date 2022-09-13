import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import {
  capitalizeFirstLetter,
  generateUserDisplayIdentifier,
  useLoggedInUser,
  User,
} from '../../utils';

export type AssignedToHeaderAssignedToTextProps = {
  user?: User;
  retrieveUser: () => User;
} & HTMLPropsAs<'p'>;

export const useAssignedToHeaderAssignedToText = (
  props: AssignedToHeaderAssignedToTextProps
) => {
  const { user, retrieveUser } = props;

  const loggedInUser = useLoggedInUser(retrieveUser);
  const isAssignedToLoggedInUser = loggedInUser.id === user?.id;

  const text = user
    ? `Assigned to
    ${capitalizeFirstLetter(
      generateUserDisplayIdentifier({
        user,
        isLoggedInUser: isAssignedToLoggedInUser,
      })
    )}`
    : 'Unassigned';

  return {
    ...props,
    children: text,
  };
};

export const AssignedToHeaderAssignedToText = createComponentAs<AssignedToHeaderAssignedToTextProps>(
  (props) => {
    const htmlProps = useAssignedToHeaderAssignedToText(props);
    return createElementAs('p', htmlProps);
  }
);
