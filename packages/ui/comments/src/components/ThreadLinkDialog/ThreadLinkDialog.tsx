import '@material/button/dist/mdc.button.css';
import '@material/dialog/dist/mdc.dialog.css';
import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/snackbar/dist/mdc.snackbar.css';
import '@material/textfield/dist/mdc.textfield.css';
import React from 'react';
import { createPortal } from 'react-dom';
import { Close } from '@styled-icons/material';
import { getThreadLinkDialogStyles } from './ThreadLinkDialog.styles';
import { ThreadLinkDialogProps } from './ThreadLinkDialog.types';
import { useThreadLinkDialog } from './useThreadLinkDialog';

export const ThreadLinkDialog = (props: ThreadLinkDialogProps) => {
  const {
    copyLinkButtonRef,
    doneButtonRef,
    inputRef,
    onClose,
    onCopyLink,
    ref,
    snackbarRef,
    threadLink,
  } = useThreadLinkDialog(props);

  const styles = getThreadLinkDialogStyles(props);

  return createPortal(
    <div
      ref={ref}
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
            <button
              className={`${styles.closeButton?.className} mdc-icon-button mdc-dialog__close`}
              css={styles.closeButton?.css}
              data-mdc-dialog-action="close"
              onClick={onClose}
              type="button"
            >
              <Close
                className={styles.icon?.className}
                css={styles.icon?.css}
              />
            </button>
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
              <input
                ref={inputRef}
                className="mdc-text-field__input"
                type="text"
                aria-label="Comment link"
                defaultValue={threadLink}
                readOnly
              />
            </label>

            <aside
              ref={snackbarRef}
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
            </aside>
          </div>
          <div className="mdc-dialog__actions">
            <button
              ref={doneButtonRef}
              type="button"
              className="mdc-button mdc-dialog__button"
              data-mdc-dialog-action="done"
              onClick={onClose}
            >
              <div className="mdc-button__ripple" />
              <span className="mdc-button__label">Done</span>
            </button>
            <button
              ref={copyLinkButtonRef}
              type="button"
              className="mdc-button mdc-dialog__button"
              data-mdc-dialog-action="copy-link"
              onClick={onCopyLink}
            >
              <div className="mdc-button__ripple" />
              <span className="mdc-button__label">Copy link</span>
            </button>
          </div>
        </div>
      </div>
      <div className="mdc-dialog__scrim" />
    </div>,
    document.body
  );
};
