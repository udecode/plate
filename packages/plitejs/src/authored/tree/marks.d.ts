import type { JsonNode } from '../../core/change/tokens';
import type { EditorJsonValue } from '../../interfaces/json';
import type { Path } from '../../interfaces/path';
import type { FormatTag } from './layers';
export declare const AUTHORED_MARKS_KEY = "authored";
type ContentMarkKind = 'delete' | 'insert';
type BoundaryMarkKind = 'join' | 'split';
type EnclosureMarkKind = 'unwrap' | 'wrap';
export type AuthoredMarkKind = BoundaryMarkKind | ContentMarkKind | EnclosureMarkKind | 'format';
type MarkBase = Readonly<{
    author: string;
    at: number;
    change: string;
}>;
/**
 * One half of a pending split of an inline element: `end` on the left half,
 * `start` on the right, which keeps the properties the split dropped. See
 * `cuts.ts`.
 */
export type CutTag = MarkBase & Readonly<{
    cut: string;
    kept?: Readonly<Record<string, EditorJsonValue>>;
    kind: 'split';
    side: 'end' | 'start';
}>;
export type AuthoredMark = (MarkBase & Readonly<{
    cut?: undefined;
    kind: Exclude<AuthoredMarkKind, 'format'>;
}>) | CutTag | FormatTag;
export declare class AuthoredMarkError extends Error {
    name: string;
    readonly path: Path;
    constructor(message: string, path: Path);
}
export declare const withMarksThroughout: (node: JsonNode, marks: readonly AuthoredMark[]) => JsonNode;
/** `node` with exactly `marks`, stored in their canonical set order. */
export declare const withAuthoredMarks: <T extends Readonly<Record<string, unknown>>>(node: T, marks: readonly AuthoredMark[]) => Omit<T, "authored">;
export declare const readAuthoredMarks: (node: unknown) => readonly AuthoredMark[];
export declare const findAuthoredMark: (nodes: readonly unknown[], change: string) => AuthoredMark | null;
/**
 * One change has one author and one creation time, so the leaves it marks can
 * merge. Unchanged nodes keep their identity, so each call visits only nodes
 * it has not seen, and change owners carry across calls, even after the
 * document stops holding the change.
 */
export declare const createAuthoredMarksValidator: () => {
    ownerOf: (change: string) => Readonly<{
        at: number;
        author: string;
    }> | null;
    validate: (children: readonly unknown[]) => void;
};
export declare const authoredMarksSchema: Readonly<{
    properties: (Readonly<{
        copy: import("../..").SchemaPropertyCopyPolicy;
        exclusive?: readonly import("../..").SchemaPropertyExclusiveGroup[];
        inclusive: boolean;
        key: "authored";
        placement: 'text';
        role: import("../..").SchemaPropertyRole;
        split: import("../..").SchemaPropertySplitPolicy;
        target?: undefined;
        typeChange: import("../..").SchemaPropertyTypeChangePolicy;
        value: import("../..").PropertySetDescriptor<import("../..").PropertyJsonDescriptor<EditorJsonValue, {}>, {}>;
    }> | Readonly<{
        copy: import("../..").SchemaPropertyCopyPolicy;
        key: "authored";
        placement: 'element';
        role: import("../..").SchemaPropertyRole;
        split: import("../..").SchemaPropertySplitPolicy;
        target: Readonly<{
            kind: "or";
            targets: readonly [Readonly<{
                kind: 'root';
                root: null;
            }>, {
                kind: 'not';
                target: Readonly<{
                    kind: 'root';
                    root: null;
                }>;
            }];
        }>;
        typeChange: import("../..").SchemaPropertyTypeChangePolicy;
        value: import("../..").PropertySetDescriptor<import("../..").PropertyJsonDescriptor<EditorJsonValue, {}>, {}>;
    }>)[];
}>;
export {};
