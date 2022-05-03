import React from 'react';
import { Comment, Thread as ThreadModel } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { FetchContacts } from '../FetchContacts';
interface SideThreadProps extends StyledProps {
    thread: ThreadModel;
    onSaveComment: (comment: Comment) => void;
    onSubmitComment: (comment: Comment) => void;
    onCancelCreateThread: () => void;
    fetchContacts: FetchContacts;
    position: {
        left: number;
        top: number;
    };
}
export declare function SideThread({ position, ...props }: SideThreadProps): React.ReactPortal;
export {};
//# sourceMappingURL=SideThread.d.ts.map