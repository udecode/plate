import type { JsonEditorValue } from '../core/change/tokens';
import type { Path } from '../interfaces/path';
import { type AuthoredMark } from './tree/marks';
import type { AuthoredChange, AuthoredChangeDetails, AuthoredChangeGroup } from './types';
type Node = Readonly<Record<string, unknown>> & {
    children?: readonly Node[];
    text?: string;
};
type Occurrence = Readonly<{
    /**
     * The first and last unit of content under the node, counted in its root.
     * A non-empty text is a unit, and so is an element without one, such as a
     * mention.
     */
    first: number;
    last: number;
    mark: AuthoredMark;
    node: Node;
    path: Path;
    root: string;
}>;
export type AuthoredChangeIndex = Readonly<{
    changes: ReadonlyMap<string, AuthoredChange>;
    /** Pending changes by creation time, then id. */
    ordered: readonly AuthoredChange[];
    occurrences: ReadonlyMap<string, readonly Occurrence[]>;
}>;
export declare const indexAuthoredChanges: (value: JsonEditorValue) => AuthoredChangeIndex;
export declare const readAuthoredDetails: (index: AuthoredChangeIndex, id: string) => AuthoredChangeDetails | null;
/** Adjacent pending changes by one author, ranked by creation. */
export declare const groupAuthoredChanges: (index: AuthoredChangeIndex) => readonly AuthoredChangeGroup[];
export {};
