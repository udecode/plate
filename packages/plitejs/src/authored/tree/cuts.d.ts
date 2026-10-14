import { type DocumentChange } from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import type { JsonEditorValue, JsonRecord } from '../../core/change/tokens';
import { type AuthoredMark, type CutTag } from './marks';
type Node = JsonRecord & {
    children?: readonly Node[];
    text?: string;
};
export declare const isCut: (mark: AuthoredMark) => mark is CutTag;
export declare const cutsOf: (node: unknown) => CutTag[];
/**
 * One block's inline children with each rejected cut joined: the fragment
 * holding the cut's `end` and the later fragment holding its `start` become
 * one element, when every node the decision keeps between them is text. A
 * `start` fragment takes back the properties the split dropped only when the
 * decision keeps its `end` fragment nowhere, since a surviving `end` fragment
 * still holds them. A join waits on pending content between the
 * fragments and on any pending tag only one of them carries. `joined` maps
 * each new element to the left fragment it continues.
 */
export declare const joinRejectedCuts: (nodes: readonly Node[], decision: Readonly<{
    endSurvives: (cut: string) => boolean;
    rejected: (cut: CutTag) => boolean;
    survives: (node: Node) => boolean;
    wait: (marks: readonly AuthoredMark[]) => void;
}>) => Readonly<{
    joined: ReadonlyMap<Node, Node>;
    nodes: readonly Node[];
}>;
/**
 * The change that moves the cuts of every fragment a transaction removed:
 * its `end` cuts go to the fragment before it in its family and its `start`
 * cuts to the fragment after it, each found through the removed fragment's
 * other cuts and, past a fragment that went too, through that one's. A cut
 * whose other side went as well was decided and moves nothing. Returns null
 * when nothing moves, otherwise the change over `after` and the index of each
 * root it changed.
 */
export declare const relinkCuts: (change: DocumentChange, before: JsonEditorValue, after: JsonEditorValue, afterIndexOf: (root: string) => DocumentIndex) => Readonly<{
    change: DocumentChange;
    indexes: ReadonlyMap<string, DocumentIndex>;
}> | null;
export {};
