import { type DocumentChange } from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { type JsonEditorValue } from '../../core/change/tokens';
import type { AnyEditor as Editor } from '../../interfaces/editor';
type Mark = Readonly<{
    at: number;
    author: string;
    change: string;
}>;
export type RecordCompletionInput = Readonly<{
    after: JsonEditorValue;
    before: JsonEditorValue;
    /** The recorded change from `before` to `after`. */
    change: DocumentChange;
    createTagId: () => string;
    editor: Editor;
    /** The indexes of `after`, by root. */
    indexes: ReadonlyMap<string, DocumentIndex>;
    mark: Mark;
}>;
export type RecordCompletion = Readonly<{
    change: DocumentChange;
    /** Built elements an element's maximum leaves no room for beside its struck content. */
    deferred: number;
    indexes: ReadonlyMap<string, DocumentIndex>;
}>;
/**
 * The fills Editing's completion builds for each element a suggestion
 * shortened, read against the proposed children: the children Editing holds
 * once every pending change is accepted. A removed element of the type a fill
 * needs stays in place, with only its content struck, when keeping it there
 * gives exactly the children Editing's completion gives; any other fill is
 * inserted as part of the change, under the insert marks of the element it
 * fills and that element's ancestors, so rejecting either removes it.
 */
export declare const completeProposed: (input: RecordCompletionInput) => RecordCompletion | null;
export {};
