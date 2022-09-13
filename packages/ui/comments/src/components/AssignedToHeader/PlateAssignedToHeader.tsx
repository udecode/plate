import React from 'react';
import { Thread, User } from '../../utils';
import { Avatar } from '../Avatar';
import { ReOpenThreadButton } from '../ReOpenThreadButton';
import { ResolveButton } from '../ResolveButton';
import { AssignedToHeader } from './AssignedToHeader';
import {
  assignedToHeaderActionsCss,
  assignedToHeaderAvatarCss,
  assignedToHeaderInformationCss,
  assignedToHeaderReOpenThreadButtonCss,
  assignedToHeaderResolveButtonCss,
  assignedToHeaderRoot,
} from './styles';

export type PlateAssignedToHeaderProps = {
  user?: User;
  retrieveUser: () => User;
  showResolveThreadButton?: boolean;
  showReOpenThreadButton?: boolean;
  thread: Thread;
  onResolveThread?: () => void;
  onReOpenThread?: () => void;
};

export const PlateAssignedToHeader = (props: PlateAssignedToHeaderProps) => {
  const { showResolveThreadButton, showReOpenThreadButton } = props;
  return (
    <div css={assignedToHeaderRoot}>
      <div css={assignedToHeaderInformationCss}>
        <Avatar.Image {...props} css={assignedToHeaderAvatarCss} />
        <AssignedToHeader.AssignedToText {...props} />
      </div>
      <div css={assignedToHeaderActionsCss}>
        {showResolveThreadButton && (
          <ResolveButton.Root {...props} css={assignedToHeaderResolveButtonCss}>
            <ResolveButton.Check />
          </ResolveButton.Root>
        )}
        {showReOpenThreadButton && (
          <ReOpenThreadButton.Root
            {...props}
            css={assignedToHeaderReOpenThreadButtonCss}
          >
            <ReOpenThreadButton.Unarchive />
          </ReOpenThreadButton.Root>
        )}
      </div>
    </div>
  );
};
