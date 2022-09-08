import React from 'react';
import { Close } from '@styled-icons/material';
import {
  threadLinkDialogCloseButtonCss,
  threadLinkDialogHeaderCss,
  threadLinkDialogLinkCss,
  threadLinkDialogRootCss,
} from './styles';
import { ThreadLinkDialog } from './ThreadLinkDialog';

export type PlateThreadLinkDialogProps = {
  onClose: () => void;
  threadLink: string;
};

export const PlateThreadLinkDialog = (props: PlateThreadLinkDialogProps) => {
  return (
    <div css={threadLinkDialogRootCss}>
      <div css={threadLinkDialogHeaderCss}>
        <h3>Link To Thread</h3>
        <ThreadLinkDialog.CloseButton
          {...props}
          css={threadLinkDialogCloseButtonCss}
        >
          <Close />
        </ThreadLinkDialog.CloseButton>
      </div>
      <div css={threadLinkDialogLinkCss}>
        <ThreadLinkDialog.Input {...props} />
        <ThreadLinkDialog.CopyIcon {...props} />
      </div>
    </div>
  );
};
