import type { AnyEditor, ContentSlice, EditorViewOptions } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
export type AuthoredChangeKind = 'delete' | 'format' | 'insert' | 'mixed' | 'structure';
/** One pending change, read from the review marks it left in the document. */
export type AuthoredChange = Readonly<{
    authorId: string;
    createdAt: number;
    id: string;
    kind: AuthoredChangeKind;
    ranges: readonly Range[];
    /** Differs whenever the change's marks or the content they mark differ. */
    revision: number;
}>;
/** One semantic part of a change, derived only when its details are read. */
export type AuthoredChangePart = Readonly<{
    action: 'delete' | 'insert' | 'replace';
    after: ContentSlice | null;
    before: ContentSlice | null;
    kind: 'content';
    range: Range;
}> | Readonly<{
    action: 'join' | 'split';
    at: Point;
    kind: 'boundary';
}> | Readonly<{
    action: 'unwrap' | 'wrap';
    kind: 'enclosure';
    path: Path;
    type: string;
}> | Readonly<{
    after: Readonly<Record<string, unknown>>;
    before: Readonly<Record<string, unknown>>;
    kind: 'properties';
    nodeKind: 'element' | 'text';
    path: Path;
}>;
export type AuthoredChangeDetails = Readonly<{
    change: AuthoredChange;
    parts: readonly AuthoredChangePart[];
}>;
/**
 * Adjacent changes by one author that one card shows, such as a deletion and
 * the insertion that replaces it. `rank` orders the group among pending
 * groups by creation, so paint and cards give it the same color.
 */
export type AuthoredChangeGroup = Readonly<{
    authorId: string;
    changes: readonly AuthoredChange[];
    id: string;
    rank: number;
}>;
export type AuthoredQuery = Readonly<{
    authorId?: string;
    cursor?: string;
    from?: number;
    limit?: number;
    to?: number;
}>;
export type AuthoredPage = Readonly<{
    cursor: string | null;
    items: readonly AuthoredChange[];
}>;
export type AuthoredDecision = Readonly<{
    action: 'accept' | 'reject';
    changes: readonly AuthoredChange[];
}>;
/**
 * `stale` names changes whose marks changed or went since they were read;
 * `blocked` names the changes the decision must take with it; `invalid` means
 * the schema refuses the decided document.
 */
export type AuthoredResult = Readonly<{
    ids: readonly string[];
    status: 'applied' | 'invalid' | 'stale' | 'unchanged';
}> | Readonly<{
    ids: readonly string[];
    status: 'blocked';
    with: readonly string[];
}>;
export type AuthoredView = NonNullable<EditorViewOptions['authored']>;
export type AuthoredOptions = Readonly<{
    /** Resolve the author once per recorded write; Suggesting requires one. */
    authorId: string | ((editor: AnyEditor) => string | null | undefined);
}>;
export type { AuthoredDocumentProjection, AuthoredProjectionDiagnostic, AuthoredProjectionRefusal, } from '../core/authored-document-capability';
