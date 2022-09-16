import React, { useCallback, useState } from 'react';
import { MoreVert } from '@styled-icons/material';
import { MoreMenu } from './MoreMenu';
import {
  moreMenuButtonRootStyles,
  moreMenuMenuItemStyles,
  moreMenuMenuRootStyles,
  moreMenuRootStyles,
} from './styles';

export type PlateMoreMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onLink?: () => void;
  showLinkButton?: boolean;
};

export const PlateMoreMenu = (props: PlateMoreMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const setMenuVisibility = useCallback((visibility: boolean) => {
    setIsMenuOpen(visibility);
  }, []);

  return (
    <div css={moreMenuRootStyles}>
      <MoreMenu.Button
        css={moreMenuButtonRootStyles}
        setMenuVisibility={setMenuVisibility}
      >
        <MoreVert />
      </MoreMenu.Button>
      {isMenuOpen ? (
        <MoreMenu.MenuRoot
          css={moreMenuMenuRootStyles}
          setMenuVisibility={setMenuVisibility}
        >
          <MoreMenu.EditButton {...props} css={moreMenuMenuItemStyles}>
            Edit
          </MoreMenu.EditButton>
          <MoreMenu.DeleteButton {...props} css={moreMenuMenuItemStyles}>
            Delete
          </MoreMenu.DeleteButton>
          <MoreMenu.LinkButton {...props} css={moreMenuMenuItemStyles}>
            Link to this thread
          </MoreMenu.LinkButton>
        </MoreMenu.MenuRoot>
      ) : null}
    </div>
  );
};
