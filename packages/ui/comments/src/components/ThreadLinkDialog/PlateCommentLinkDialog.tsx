import React from 'react';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { Close } from '@styled-icons/material';
import { CommentLinkDialog } from './CommentLinkDialog';
import {
  commentLinkDialogCopyButtonCss,
  commentLinkDialogHeaderCss,
  commentLinkDialogInputCss,
} from './styles';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '1px solid grey',
  boxShadow: 24,
  borderRadius: '8px',
  px: 4,
  py: 2,
};

/**
 * wip
 */
export const PlateCommentLinkDialog = () => {
  return (
    <>
      <Modal open>
        <Box sx={style}>
          <div css={commentLinkDialogHeaderCss}>
            <Typography variant="h6" component="h2">
              Link to thread
            </Typography>
            <IconButton color="error">
              <CommentLinkDialog.CloseButton>
                <Close size={22} />
              </CommentLinkDialog.CloseButton>
            </IconButton>
          </div>
          <CommentLinkDialog.Input
            type="text"
            css={commentLinkDialogInputCss}
          />
          <div css={commentLinkDialogCopyButtonCss}>
            <Button variant="text" color="primary" size="small">
              <CommentLinkDialog.CopyLink>
                <Typography>Copy link</Typography>
              </CommentLinkDialog.CopyLink>
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};
