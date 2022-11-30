import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@styled-icons/material';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { useCommentsActions } from '../CommentsProvider';
import { DeleteCommentButton } from './DeleteCommentButton';
import { EditCommentButton } from './EditCommentButton';

export const menuButtonCss = css`
  ${tw`p-1`};
`;

export const menuButtonItemCss = css`
  ${tw`w-full h-full`};
`;

export const PlateCommmentMenuButton = () => {
  const setMenuRef = useCommentsActions().menuRef();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const ref = useRef(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    setMenuRef(ref);
  }, [setMenuRef]);

  const onClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

  return (
    <div ref={ref}>
      <IconButton color="default" onClick={onClick} css={menuButtonCss}>
        <MoreVert size={22} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={onClose}>
          <EditCommentButton css={menuButtonItemCss}>
            Edit comment
          </EditCommentButton>
        </MenuItem>

        <MenuItem onClick={onClose}>
          <DeleteCommentButton css={menuButtonItemCss}>
            Delete comment
          </DeleteCommentButton>
        </MenuItem>

        {/* {showLinkToThisComment && ( */}
        {/*  <MenuItem onClick={handleClose}> */}
        {/*    <MenuButton.LinkItem {...props} css={menuButtonItemCss}> */}
        {/*      Link to this thread */}
        {/*    </MenuButton.LinkItem> */}
        {/*  </MenuItem> */}
        {/* )} */}
      </Menu>
    </div>
  );
};
