import React from 'react';
import { css } from 'styled-components';
import { Thread, User } from '../../types';
import { useLoggedInUser } from '../../utils/useLoggedInUser';
import { PlateAvatar } from '../Avatar';
import { PlateReOpenThreadButton } from '../ReOpenThreadButton';
import { PlateResolveButton } from '../ResolveButton';
import { AssignedToHeaderUserDisplayIdentifier } from './AssignedToHeaderUserDisplayIdentifier';
import {
  assignedToHeaderActionsCss,
  assignedToHeaderAssignedToContainerCss,
  assignedToHeaderAssignedToTextCss,
  assignedToHeaderAssignedToUserNameCss,
  assignedToHeaderAvatarContainerCss,
  assignedToHeaderRootCss,
} from './styles';

type PlateAssignedToHeaderProps = {
  thread: Thread;
  assignedTo: User;
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  retrieveUser: () => User;
  onResolveThread: () => void;
  onReOpenThread: () => void;
};

export const PlateAssignedToHeader = (props: PlateAssignedToHeaderProps) => {
  const {
    assignedTo,
    retrieveUser,
    showReOpenThreadButton,
    showResolveThreadButton,
  } = props;

  const loggedInUser = useLoggedInUser(retrieveUser);
  const isAssignedToLoggedInUser = loggedInUser?.id === assignedTo.id;

  return (
    <div
      css={[
        assignedToHeaderRootCss,
        css`
          color: ${isAssignedToLoggedInUser ? 'white' : 'rgb(60, 64, 67)'};
          background-color: ${isAssignedToLoggedInUser ? '#1a73e8' : '#e8f0fe'};
        `,
      ]}
    >
      <div css={assignedToHeaderAvatarContainerCss}>
        <PlateAvatar user={assignedTo} />
      </div>
      <div css={assignedToHeaderAssignedToContainerCss}>
        <div css={assignedToHeaderAssignedToTextCss}>Assigned to</div>
        <AssignedToHeaderUserDisplayIdentifier
          {...props}
          css={assignedToHeaderAssignedToUserNameCss}
        />
      </div>
      <div css={assignedToHeaderActionsCss}>
        {showResolveThreadButton ? <PlateResolveButton {...props} /> : null}
        {showReOpenThreadButton ? <PlateReOpenThreadButton {...props} /> : null}
      </div>
    </div>
  );
};
