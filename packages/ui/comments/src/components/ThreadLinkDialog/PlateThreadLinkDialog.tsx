import React from 'react';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { Close } from '@styled-icons/material';
import {
  threadLinkDialogCopyButtonCss,
  threadLinkDialogHeaderCss,
  threadLinkDialogInputCss,
} from './styles';
import { ThreadLinkDialog } from './ThreadLinkDialog';

export type PlateCommentLinkDialogProps = {
  threadLink: string;
  onClose: () => void;
};

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

export const PlateThreadLinkDialog = (props: PlateCommentLinkDialogProps) => {
  return (
    <>
      <Modal open>
        <Box sx={style}>
          <div css={threadLinkDialogHeaderCss}>
            <Typography variant="h6" component="h2">
              Link to thread
            </Typography>
            <IconButton color="error">
              <ThreadLinkDialog.CloseButtonRoot {...props}>
                <Close size={22} />
              </ThreadLinkDialog.CloseButtonRoot>
            </IconButton>
          </div>
          <ThreadLinkDialog.Input
            {...props}
            type="text"
            css={threadLinkDialogInputCss}
          />
          <div css={threadLinkDialogCopyButtonCss}>
            <Button variant="text" color="primary" size="small">
              <ThreadLinkDialog.CopyLinkRoot {...props}>
                <Typography>Copy link</Typography>
              </ThreadLinkDialog.CopyLinkRoot>
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};
