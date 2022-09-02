import React from 'react';
import { css } from 'styled-components';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { generateUserDisplayIdentifier } from '../../utils/generateUserDisplayIdentifier';
import { Avatar } from '../Avatar/Avatar';
import { ReOpenThreadButton } from '../ReOpenThreadButton/ReOpenThreadButton';
import { ResolveButton } from '../ResolveButton/ResolveButton';
import { getAssignedToHeaderStyles } from './AssignedToHeader.styles';
import { AssignedToHeaderProps } from './AssignedToHeader.types';
import { useAssignedToHeader } from './useAssignedToHeader';

export const AssignedToHeader = (props: AssignedToHeaderProps) => {
  const {
    assignedTo,
    isAssignedToLoggedInUser,
    onReOpenThread,
    onResolveThread,
    showReOpenThreadButton,
    showResolveThreadButton,
    thread,
  } = useAssignedToHeader(props);

  const styles = getAssignedToHeaderStyles({
    ...props,
    isAssignedToLoggedInUser,
  });

  return (
    <div css={styles.root.css} className={styles.root.className}>
      <div css={styles.avatar?.css} className={styles.avatar?.className}>
        <Avatar user={assignedTo} />
      </div>
      <div
        css={styles.assignedTo?.css}
        className={styles.assignedTo?.className}
      >
        <div
          css={styles.assignedToLabel?.css}
          className={styles.assignedToLabel?.className}
        >
          Assigned to
        </div>
        <div
          css={styles.assignedToDisplayName?.css}
          className={styles.assignedToDisplayName?.className}
        >
          {capitalizeFirstLetter(
            generateUserDisplayIdentifier({
              user: assignedTo,
              isLoggedInUser: isAssignedToLoggedInUser,
            })
          )}
        </div>
      </div>
      <div css={styles.done?.css} className={styles.done?.className}>
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
          <ReOpenThreadButton
            onReOpenThread={onReOpenThread}
            styles={{
              icon: css`
                color: ${isAssignedToLoggedInUser
                  ? 'white'
                  : 'rgb(60, 64, 67)'};
              `,
            }}
          />
        )}
      </div>
    </div>
  );
};
