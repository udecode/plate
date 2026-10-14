import { DocumentChange } from '../../core/change/document-change';
import { type DocumentSetPropertyResolver } from '../../core/change/root-change';
import { type JsonEditorValue } from '../../core/change/tokens';
import { type AuthoredResolveSchema } from './resolve';
type Options = Readonly<{
    isSetValued?: DocumentSetPropertyResolver;
}>;
type Projection = Readonly<{
    change: DocumentChange;
    value: JsonEditorValue;
}>;
/** How a decision settles a node by its own marks. */
export type SettledBy = Readonly<{
    joins: (node: unknown) => boolean;
    removes: (node: unknown) => boolean;
}>;
/**
 * The change of the main root to its settled form aligned by characters: the
 * decision keeps each character no removed leaf holds, in order, so each one
 * keeps its place, and only the tokens between two of them change. Between
 * two characters, matching tokens at either end stay, with their props set to
 * the settled ones, and the rest is replaced. Null when the characters differ
 * or the change does not give `accepted`.
 */
export declare const characterAlignedChange: (stored: JsonEditorValue, accepted: JsonEditorValue, settledBy?: SettledBy) => DocumentChange | null;
/**
 * The change that accepts every pending change, built from the marks so a
 * position inside merged pieces keeps its place, or null when that walk does
 * not give `accepted`. The walk reads the main root alone.
 */
export declare const structuralAcceptedChange: (stored: JsonEditorValue, accepted: JsonEditorValue) => DocumentChange | null;
/**
 * The accepted projection for commands, memoized per top-level run and
 * carried from one stored document to the next: only the runs inside the
 * window where the two documents' top-level blocks differ resolve again, and
 * the accepted index takes one replacement there, so a key costs the same
 * however long the document is.
 */
export declare const createCommandProjector: (schemaOf: () => AuthoredResolveSchema | null, options: Options) => (stored: JsonEditorValue) => Projection | null;
export {};
