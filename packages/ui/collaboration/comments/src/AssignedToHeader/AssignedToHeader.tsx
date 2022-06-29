import React from 'react';
import { User } from '@xolvio/plate-comments';
import { css } from 'styled-components';
import { Avatar } from '../Avatar/Avatar';
import { capitalizeFirstLetter } from '../capitalizeFirstLetter';
import { OnReOpenThread } from '../OnReOpenThread';
import { OnResolveThread } from '../OnResolveThread';
import { ReOpenThreadButton } from '../ReOpenThreadButton';
import { ResolveButton } from '../ResolveButton';
import { RetrieveUser } from '../useComments';
import { useLoggedInUser } from '../useLoggedInUser';
import {
  AssignedToHeaderStyledProps,
  createAssignedToHeaderStyles,
} from './AssignedToHeader.styles';
import { generateUserDisplayIdentifier } from './generateUserDisplayIdentifier';

export function AssignedToHeader(
  props: {
    assignedTo: User;
    showResolveThreadButton: boolean;
    showReOpenThreadButton: boolean;
    retrieveUser: RetrieveUser;
    onResolveThread: OnResolveThread;
    onReOpenThread: OnReOpenThread;
  } & AssignedToHeaderStyledProps
) {
  const {
    assignedTo,
    showResolveThreadButton,
    showReOpenThreadButton,
    retrieveUser,
    onResolveThread,
    onReOpenThread,
  } = props;

  const loggedInUser = useLoggedInUser({ retrieveUser });

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
