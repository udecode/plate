/// <reference types="react" />
import { Comment, Thread as ThreadModel } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { FetchContacts } from '../FetchContacts';
interface SideThreadProps extends StyledProps {
    thread: ThreadModel;
    onSubmitComment: (comment: Comment) => void;
    onCancelCreateThread: () => void;
    fetchContacts: FetchContacts;
    position: {
        left: number;
        top: number;
    };
}
export declare function SideThread({ position, ...props }: SideThreadProps): JSX.Element;
export {};
//# sourceMappingURL=SideThread.d.ts.map