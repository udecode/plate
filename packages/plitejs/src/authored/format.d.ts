import { DocumentChange } from '../core/change/document-change';
import type { JsonEditorValue } from '../core/change/tokens';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import type { AnyEditor, EditorDocumentValue } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import { type Point } from '../interfaces/point';
import { type Range } from '../interfaces/range';
import type { AuthoredDocumentProjection, AuthoredProjectionRefusal } from './types';
export type AuthoredFormatProjection = 'accepted' | 'proposed';
/**
 * The refusal of a projection that would decide pending changes under a
 * schema that generates property values, or null.
 *
 * @internal
 */
export declare const projectionRefusal: (document: EditorDocumentValue, schema: CompiledEditorSchema) => AuthoredProjectionRefusal | null;
/**
 * Read a stored document with every pending change accepted (`proposed`) or
 * rejected (`accepted`). An editor's schema completes containers a decision
 * empties; without one, the pure resolver leaves them as the decision did.
 * With pending changes under a schema that generates property values, it
 * builds nothing and reports why.
 */
export declare function projectAuthoredDocument(document: EditorDocumentValue, options: Readonly<{
    projection: AuthoredFormatProjection;
}>): AuthoredDocumentProjection;
export declare function projectAuthoredDocument(document: EditorDocumentValue, options: Readonly<{
    editor?: AnyEditor;
    projection: AuthoredFormatProjection;
}>): AuthoredDocumentProjection | AuthoredProjectionRefusal;
export type AuthoredLocationMap = Readonly<{
    path: (path: Path) => Path | null;
    point: (point: Point, assoc: -1 | 1) => Point | null;
    range: (range: Range) => Range | null;
}>;
/**
 * Map locations of one root of a stored document onto a projection through
 * `change`, the stored document's change to it. Each map returns null for
 * content the projection does not keep.
 */
export declare const authoredLocationMap: (document: JsonEditorValue, projected: JsonEditorValue, change: DocumentChange, root: string) => AuthoredLocationMap;
/**
 * Map a range of a stored document onto one of its projections, or null when
 * the projection keeps none of its content.
 */
export declare const projectAuthoredRange: (document: EditorDocumentValue, projected: EditorDocumentValue, range: Range) => Range | null;
