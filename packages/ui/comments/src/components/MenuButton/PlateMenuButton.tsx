import React, { MouseEvent } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@styled-icons/material';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { MenuButton } from './MenuButton';

export type MenuButtonProps = {
  showLinkToThisComment?: boolean;
};

export const menuButtonCss = css`
  ${tw`p-1`};
`;

export const menuButtonItemCss = css`
  ${tw`w-full h-full`};
`;

export const PlateMenuButton = (props: MenuButtonProps) => {
  const { showLinkToThisComment } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton color="default" onClick={handleClick} css={menuButtonCss}>
        <MoreVert size={22} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleClose}>
          <MenuButton.EditItem {...props} css={menuButtonItemCss}>
            Edit
          </MenuButton.EditItem>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <MenuButton.DeleteItem {...props} css={menuButtonItemCss}>
            Delete thread
          </MenuButton.DeleteItem>
        </MenuItem>
        {showLinkToThisComment && (
          <MenuItem onClick={handleClose}>
            <MenuButton.LinkItem {...props} css={menuButtonItemCss}>
              Link to this thread
            </MenuButton.LinkItem>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};
