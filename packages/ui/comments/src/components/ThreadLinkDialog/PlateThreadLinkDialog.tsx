import '@material/button/dist/mdc.button.css';
import '@material/dialog/dist/mdc.dialog.css';
import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/snackbar/dist/mdc.snackbar.css';
import '@material/textfield/dist/mdc.textfield.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Close } from '@styled-icons/material';
import { threadLinkDialogCloseButtonCss } from './styles';
import { ThreadLinkDialog } from './ThreadLinkDialog';

type PlateCommentLinkDialogProps = {
  threadLink: string;
  onClose: () => void;
};

export const PlateThreadLinkDialog = (props: PlateCommentLinkDialogProps) => {
  return ReactDOM.createPortal(
    <ThreadLinkDialog.Root
      {...props}
      className="mdc-dialog mdc-dialog--open mdc-dialog--fullscreen"
    >
      <div className="mdc-dialog__container">
        <div
          className="mdc-dialog__surface"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="comment-link-dialog-title"
          aria-describedby="comment-link-dialog-content"
        >
          <div className="mdc-dialog__header">
            <h2 className="mdc-dialog__title" id="comment-link-dialog-title">
              Link to thread
            </h2>
            <ThreadLinkDialog.CloseButton
              {...props}
              css={threadLinkDialogCloseButtonCss}
              className="mdc-icon-button mdc-dialog__close"
              data-mdc-dialog-action="close"
            >
              <div className="mdc-icon-button__ripple" />
              <Close />
            </ThreadLinkDialog.CloseButton>
          </div>
          <div className="mdc-dialog__content" id="comment-link-dialog-content">
            <label
              className="mdc-text-field mdc-text-field--outlined mdc-text-field--no-label"
              style={{ width: '100%' }}
            >
              <span className="mdc-notched-outline">
                <span className="mdc-notched-outline__leading" />
                <span className="mdc-notched-outline__trailing" />
              </span>
              <ThreadLinkDialog.Input
                {...props}
                className="mdc-text-field__input"
                type="text"
                aria-label="Comment link"
              />
            </label>
            <ThreadLinkDialog.Snackbar
              {...props}
              className="mdc-snackbar"
              style={{ bottom: '0.5rem' }}
            >
              <div
                className="mdc-snackbar__surface"
                role="status"
                aria-relevant="additions"
              >
                <div className="mdc-snackbar__label" aria-atomic="false">
                  The link has been copied to the clipboard.
                </div>
              </div>
            </ThreadLinkDialog.Snackbar>
          </div>
          <div className="mdc-dialog__actions">
            <ThreadLinkDialog.DoneButton
              {...props}
              type="button"
              className="mdc-button mdc-dialog__button"
              data-mdc-dialog-action="done"
            >
              <div className="mdc-button__ripple" />
              <span className="mdc-button__label">Done</span>
            </ThreadLinkDialog.DoneButton>
            <ThreadLinkDialog.CopyLinkButton
              {...props}
              className="mdc-button mdc-dialog__button"
              data-mdc-dialog-action="copy-link"
            >
              <div className="mdc-button__ripple" />
              <span className="mdc-button__label">Copy link</span>
            </ThreadLinkDialog.CopyLinkButton>
          </div>
        </div>
      </div>
      <div className="mdc-dialog__scrim" />
    </ThreadLinkDialog.Root>,
    document.body
  );
};
