import { PlateEditor } from '@udecode/plate-core';
import { Location } from 'slate';
import { Thread } from '../Thread';
import { ThreadNodeData } from '../types';
export declare function upsertThread<T = {}>(editor: PlateEditor<T>, { at, thread, elementProps, }: {
    thread: Thread;
    at: Location;
    elementProps?: Partial<ThreadNodeData>;
}): any;
//# sourceMappingURL=upsertThread.d.ts.map