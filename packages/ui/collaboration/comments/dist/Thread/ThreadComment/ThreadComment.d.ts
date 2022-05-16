/// <reference types="react" />
import '@material/menu-surface/dist/mdc.menu-surface.css';
import { StyledProps } from '@udecode/plate-styled-components';
import { Comment, Thread } from '@xolvio/plate-comments';
export declare function ThreadComment(props: {
    comment: Comment;
    thread: Thread;
    showResolveThreadButton: boolean;
    showReOpenThreadButton: boolean;
    showMoreButton: boolean;
    showLinkToThisComment: boolean;
    onSaveComment: (comment: Comment) => void;
    onResolveThread: () => void;
    onReOpenThread: () => void;
    onDelete: (comment: Comment) => void;
} & StyledProps): JSX.Element;
//# sourceMappingURL=ThreadComment.d.ts.map