import type { AuthoredVeto } from '../core/authored-veto';
import type { DraftStep } from '../core/change/builder';
import { type JsonEditorValue } from '../core/change/tokens';
import { EditorRefusalError } from '../core/refusal';
import type { CompiledEditorSchema } from '../core/schema-compiler';
/** Why Suggesting refused a change whole, so nothing of it applied. */
export type AuthoredRefusal = Readonly<{
    /**
     * `veto`: the change touches elements a feature's review marks cannot hold
     * yet, named in `reasons`. `generated-values`: the schema constructs
     * property values, which would differ between recording, accepting and
     * rejecting. `unrepresentable`: the review marks cannot hold the change,
     * such as deleting a named root.
     */
    code: 'generated-values' | 'unrepresentable' | 'veto';
    message: string;
    /** Each veto reason the change met, such as `'table'`. */
    reasons: readonly string[];
}>;
/**
 * The refusal of a Suggesting change whose steps touch an element a veto
 * names: an element open around a write, one a removal overlaps, one the
 * write inserts, or one whose properties it edits, before or after the edit.
 */
export declare const proposalRefusal: (steps: readonly DraftStep[], before: JsonEditorValue, vetoes: readonly AuthoredVeto[]) => AuthoredRefusal | null;
/** Whether the schema generates a value for an element property. */
export declare const constructsValues: (schema: CompiledEditorSchema) => boolean;
export declare const GENERATED_VALUES_REFUSAL: AuthoredRefusal;
/** The refusal of a Suggesting change whose review form the schema cannot hold. */
export declare const unrepresentable: (message: string) => EditorRefusalError;
