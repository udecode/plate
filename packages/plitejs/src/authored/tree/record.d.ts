import type { DraftStep } from '../../core/change/builder';
import { type DocumentChange } from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { type JsonEditorValue, type JsonNode, type JsonRecord } from '../../core/change/tokens';
export type AuthoredRecordIntent = 'edit' | 'propose';
export type AuthoredRecordInput = Readonly<{
    before: JsonEditorValue;
    /** Id of the change a Suggesting transaction creates. */
    changeId: string;
    createRoots: ReadonlySet<string>;
    /**
     * A fresh id for each format tag and inline split cut, unique across
     * collaborators.
     */
    createTagId: () => string;
    /**
     * The children an element keeps when a suggestion withdraws every child,
     * as completion builds them at `site`: the element and its ancestors,
     * nearest first.
     */
    fill: (site: ReadonlyArray<Readonly<JsonRecord>>, root: string) => readonly JsonNode[];
    deleteRoots: ReadonlySet<string>;
    /**
     * Whether an empty text keeps property `key` at `value` under `parents`,
     * nearest first, as the canonical form decides.
     */
    emptyTextKeeps: (key: string, value: unknown, parents: ReadonlyArray<Readonly<JsonRecord>>, root: string) => boolean;
    /** A forced change: "own" then means this change, not the writer. */
    forcedChangeId?: string | null;
    /** The steps start with a command frame's seed. */
    framed?: boolean;
    intent: AuthoredRecordIntent;
    /** Whether an element with `props` is inline, so a split of it records a cut. */
    isInline: (props: Readonly<JsonRecord>) => boolean;
    /** Whether a split's continued element keeps property `key` of `props`. */
    keepsOnSplit: (props: Readonly<JsonRecord>, path: readonly number[], root: string, key: string, draftRoot: readonly JsonNode[]) => boolean;
    now: number;
    /** Element types that hold exactly one text, which marks must not split. */
    oneText?: (type: string) => boolean;
    /** The collapsed caret's position in the before document, and its root. */
    selectionBefore?: Readonly<{
        position: number;
        root: string;
    }> | null;
    steps: readonly DraftStep[];
    writer: string;
}>;
export type AuthoredRecordResult = Readonly<{
    anchorChange: (plainAfter: (root: string) => DocumentIndex) => DocumentChange;
    change: DocumentChange;
    indexedAfter: ReadonlyMap<string, DocumentIndex>;
    /**
     * Map a position in the plain draft after the last step into the recorded
     * document. A selection position is a `caret`, the default: at a removal
     * kept in place, it goes to the side the deletion moved away from.
     */
    mapPosition: (root: string, position: number, assoc: -1 | 1, caret?: boolean) => number;
}>;
/**
 * Record a transaction's steps as the review tree's change. Each step folds
 * through a review draft: it is rebased from the plain draft into the review
 * draft, recorded there and applied, so each step reads the review state the
 * earlier ones left. Recording keys only on token kind, existing marks, the
 * step's origin and move link, intent and writer, so it imports no plugin or
 * command module.
 */
export declare const recordAuthoredSteps: (input: AuthoredRecordInput) => AuthoredRecordResult;
