import React from 'react';
import { Thread, User } from '@xolvio/plate-comments';
import { css } from 'styled-components';
import { OnReOpenThread, OnResolveThread, RetrieveUser } from '../../types';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { generateUserDisplayIdentifier } from '../../utils/generateUserDisplayIdentifier';
import { useLoggedInUser } from '../../utils/useLoggedInUser';
import { Avatar } from '../Avatar/Avatar';
import { ReOpenThreadButton } from '../ReOpenThreadButton/ReOpenThreadButton';
import { ResolveButton } from '../ResolveButton/ResolveButton';
import {
  AssignedToHeaderStyledProps,
  createAssignedToHeaderStyles,
} from './AssignedToHeader.styles';

export function AssignedToHeader(
  props: {
    thread: Thread;
    assignedTo: User;
    showResolveThreadButton: boolean;
    showReOpenThreadButton: boolean;
    retrieveUser: RetrieveUser;
    onResolveThread: OnResolveThread;
    onReOpenThread: OnReOpenThread;
  } & AssignedToHeaderStyledProps
) {
  const {
    thread,
    assignedTo,
    showResolveThreadButton,
    showReOpenThreadButton,
    retrieveUser,
    onResolveThread,
    onReOpenThread,
  } = props;

  const loggedInUser = useLoggedInUser(retrieveUser);

  const isAssignedToLoggedInUser = loggedInUser.id === assignedTo.id;

  const {
    root,
    avatar,
    assignedTo: assignedToContainer,
    assignedToLabel,
    assignedToDisplayName,
    done,
  } = createAssignedToHeaderStyles({
    ...props,
    isAssignedToLoggedInUser,
  });

  return (
    <div css={root.css} className={root.className}>
      <div css={avatar!.css} className={avatar!.className}>
        <Avatar user={assignedTo} />
      </div>
      <div
        css={assignedToContainer!.css}
        className={assignedToContainer!.className}
      >
        <div css={assignedToLabel!.css} className={assignedToLabel!.className}>
          Assigned to
        </div>
        <div
          css={assignedToDisplayName!.css}
          className={assignedToDisplayName!.className}
        >
          {capitalizeFirstLetter(
            generateUserDisplayIdentifier({
              user: assignedTo,
              isLoggedInUser: isAssignedToLoggedInUser,
            })
          )}
        </div>
      </div>
      <div css={done!.css} className={done!.className}>
        {showResolveThreadButton && (
          <ResolveButton
            thread={thread}
            onResolveThread={onResolveThread}
            styles={{
              icon: css`
                color: ${isAssignedToLoggedInUser
                  ? 'white'
                  : 'rgb(60, 64, 67)'};
              `,
            }}
          />
        )}
        {showReOpenThreadButton && (
          <ReOpenThreadButton onReOpenThread={onReOpenThread} />
        )}
      </div>
    </div>
  );
}
