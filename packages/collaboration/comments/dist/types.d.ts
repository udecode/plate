import { Node } from 'slate';
import { Thread } from './Thread';
export interface ThreadNodeData {
    thread: Thread;
    selected: boolean;
}
export declare type ThreadNode = Node & ThreadNodeData;
export interface ThreadPlugin {
}
//# sourceMappingURL=types.d.ts.map