import type { AuthoredProjectionDiagnostic } from '../../core/authored-document-capability';
import type { JsonEditorValue, JsonNode, JsonRecord } from '../../core/change/tokens';
export type AuthoredOutcome = (changeId: string) => 'accept' | 'keep' | 'reject';
type Completion<N> = Readonly<{
    built: ReadonlyArray<Readonly<{
        node: N;
        slot: number | null;
    }>>;
    children: readonly N[];
}>;
/**
 * The declarative content facts the resolver reads; it runs no plugin code.
 * A `null` type or parent stands for the root being resolved.
 */
export type AuthoredResolveSchema = Readonly<{
    /**
     * Canonical children at their site, the element and its ancestors nearest
     * first or none at the root, as Editing's completion gives them, and each
     * element it built; `vacated` names the prefix slots a decision emptied.
     */
    complete?: (children: readonly JsonNode[], site: readonly JsonRecord[], root: string, vacated: (slot: number, candidate: JsonNode) => boolean) => Completion<JsonNode>;
    content: (type: string | null, root: string) => Readonly<{
        allowsText: boolean;
        min: number;
        prefix: number;
    }> | null;
}>;
export type AuthoredResolution = Readonly<{
    /** Pending changes the decision waits on, which must be decided with it. */
    blockers: readonly string[];
    children: readonly JsonNode[];
    decided: readonly string[];
    diagnostics: readonly AuthoredProjectionDiagnostic[];
    /**
     * The node an original node became in the resolved tree, or null when a
     * decision removed it or merged it into the block before it, the canonical
     * form merged a text with its neighbour, or the canonical pass after
     * completion rewrote it.
     */
    resolvedOf: (original: unknown) => JsonNode | null;
    /**
     * Content no level of the schema accepts, such as text an unwrap leaves
     * among blocks.
     */
    unplaceable: boolean;
}>;
type Node = JsonRecord & {
    children?: readonly Node[];
    text?: string;
};
/** @internal */
export declare const acceptedOwnShape: (node: Node) => 'bail' | 'drop' | 'keep' | 'liftChildren' | 'mergeUp';
/** @internal */
export declare const hasJoinMark: (node: unknown) => boolean;
/** @internal */
export declare const hasBoundaryMark: (node: unknown) => boolean;
/** An element holding texts; one with no children holds no blocks, so it counts. */
export declare const isTextBlock: (node: unknown) => boolean;
/**
 * The only implementation of accept and reject. Phase one finds, against the
 * input document, where each accepted join or rejected split lands: it merges
 * its block into the nearest preceding text block the decision keeps, never
 * leaving a container the decision keeps. Phase two rebuilds the document:
 * text goes when one of its insert marks is rejected or one of its delete
 * marks is accepted, a block goes when its own mark says so and nothing
 * inside it survives, and an accepted unwrap or rejected wrap lifts the
 * block's children. Decided format marks keep or restore their values.
 * Undecided marks stay.
 */
export declare const resolveAuthoredChildren: (children: readonly JsonNode[], outcome: AuthoredOutcome, schema?: AuthoredResolveSchema | null, root?: string) => AuthoredResolution;
export declare const resolveAuthoredValue: (value: JsonEditorValue, outcome: AuthoredOutcome, schema?: AuthoredResolveSchema | null) => {
    blockers: string[];
    decided: string[];
    diagnostics: AuthoredProjectionDiagnostic[];
    resolvedOf: (original: unknown) => JsonNode | null;
    unplaceable: boolean;
    value: JsonEditorValue;
};
/**
 * `proposed` reads the document with every pending change accepted;
 * `accepted` reads it with every pending change rejected.
 */
export declare const projectAuthoredValue: (value: JsonEditorValue, projection: 'accepted' | 'proposed', schema?: AuthoredResolveSchema | null) => {
    blockers: string[];
    decided: string[];
    diagnostics: AuthoredProjectionDiagnostic[];
    resolvedOf: (original: unknown) => JsonNode | null;
    unplaceable: boolean;
    value: JsonEditorValue;
};
/**
 * Read nodes of the document as one projection reads them: the whole document
 * is projected first, so a node under a struck ancestor is not read as live.
 * A node a decision removed or merged into the block before it, a text the
 * canonical form merged with its neighbour, or a node the canonical pass after
 * completion rewrote reads as `null`.
 */
export declare const projectAuthoredFragment: (value: JsonEditorValue, projection: 'accepted' | 'proposed', paths: ReadonlyArray<readonly number[]>, schema?: AuthoredResolveSchema | null) => (JsonNode | null)[];
export {};
