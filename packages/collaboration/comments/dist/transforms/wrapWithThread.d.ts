import { PlateEditor } from '@udecode/plate-core';
import { Location } from 'slate';
import { Thread } from '../Thread';
import { ThreadNodeData } from '../types';
export declare const wrapWithThread: <T = {}>(editor: PlateEditor<T>, { at, thread, elementProps, }: {
    thread: Thread;
    at?: Location | undefined;
    elementProps?: Partial<ThreadNodeData> | undefined;
}) => void;
//# sourceMappingURL=wrapWithThread.d.ts.map