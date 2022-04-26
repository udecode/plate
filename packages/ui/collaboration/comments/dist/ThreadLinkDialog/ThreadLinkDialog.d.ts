import '@material/button/dist/mdc.button.css';
import '@material/dialog/dist/mdc.dialog.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/snackbar/dist/mdc.snackbar.css';
import '@material/icon-button/dist/mdc.icon-button.css';
import React from 'react';
import { MDCDialog } from '@material/dialog';
import { MDCSnackbar } from '@material/snackbar';
import { StyledProps } from '@udecode/plate-styled-components';
interface CommentLinkDialogProps extends StyledProps {
    threadLink: string;
    onClose: () => void;
}
export declare class ThreadLinkDialog extends React.Component<CommentLinkDialogProps> {
    ref: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLInputElement>;
    snackbarRef: React.RefObject<HTMLElement>;
    doneButtonRef: React.RefObject<HTMLButtonElement>;
    copyLinkButtonRef: React.RefObject<HTMLButtonElement>;
    dialog?: MDCDialog;
    snackbar?: MDCSnackbar;
    closeButton: any;
    constructor(props: CommentLinkDialogProps);
    componentDidMount(): void;
    onCopyLink(): Promise<void>;
    render(): React.ReactPortal;
}
export {};
//# sourceMappingURL=ThreadLinkDialog.d.ts.map