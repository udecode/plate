import {
  DocumentChange,
  getInternalDocumentRootChange,
  valueRoot,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import type { JsonEditorValue } from '../core/change/tokens';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import type { AnyEditor, EditorDocumentValue } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { indexAuthoredChanges } from './changes';
import { constructsValues } from './refusal';
import { authoredResolveSchemaOf } from './resolve-schema';
import { projectAuthoredValue } from './tree/resolve';
import type {
  AuthoredDocumentProjection,
  AuthoredProjectionRefusal,
} from './types';

export type AuthoredFormatProjection = 'accepted' | 'proposed';

/**
 * The refusal of a projection that would decide pending changes under a
 * schema that generates property values, or null.
 *
 * @internal
 */
export const projectionRefusal = (
  document: EditorDocumentValue,
  schema: CompiledEditorSchema
): AuthoredProjectionRefusal | null => {
  if (!constructsValues(schema)) return null;
  const pending = indexAuthoredChanges(document as JsonEditorValue).changes
    .size;

  return pending === 0
    ? null
    : Object.freeze({
        diagnostics: Object.freeze([
          Object.freeze({
            code: 'authored-generated-values' as const,
            message:
              'This schema generates property values, so its documents with suggestions have no accepted or proposed projection.',
            severity: 'error' as const,
          }),
        ] as const),
        ok: false as const,
        pending,
      });
};

/**
 * Read a stored document with every pending change accepted (`proposed`) or
 * rejected (`accepted`). An editor's schema completes containers a decision
 * empties; without one, the pure resolver leaves them as the decision did.
 * With pending changes under a schema that generates property values, it
 * builds nothing and reports why.
 */
export function projectAuthoredDocument(
  document: EditorDocumentValue,
  options: Readonly<{ projection: AuthoredFormatProjection }>
): AuthoredDocumentProjection;
export function projectAuthoredDocument(
  document: EditorDocumentValue,
  options: Readonly<{
    editor?: AnyEditor;
    projection: AuthoredFormatProjection;
  }>
): AuthoredDocumentProjection | AuthoredProjectionRefusal;
export function projectAuthoredDocument(
  document: EditorDocumentValue,
  options: Readonly<{
    editor?: AnyEditor;
    projection: AuthoredFormatProjection;
  }>
): AuthoredDocumentProjection | AuthoredProjectionRefusal {
  const refusal =
    options.editor &&
    projectionRefusal(document, getCompiledEditorSchema(options.editor));

  if (refusal) return refusal;

  const value = document as JsonEditorValue;
  const resolution = projectAuthoredValue(
    value,
    options.projection,
    options.editor ? authoredResolveSchemaOf(options.editor) : null
  );

  const pending = indexAuthoredChanges(value).changes.size;

  return Object.freeze({
    diagnostics: Object.freeze([
      ...(pending === 0
        ? []
        : [
            Object.freeze({
              code: 'authored-lossy-projection' as const,
              message: `The ${options.projection} projection decides ${pending} pending change${
                pending === 1 ? '' : 's'
              }.`,
              severity: 'warning' as const,
            }),
          ]),
      ...resolution.diagnostics,
    ]),
    document: resolution.value as EditorDocumentValue,
    ok: true as const,
    pending,
  });
}

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
export const authoredLocationMap = (
  document: JsonEditorValue,
  projected: JsonEditorValue,
  change: DocumentChange,
  root: string
): AuthoredLocationMap => {
  const rootChange = getInternalDocumentRootChange(change, root);
  const beforeIndex = DocumentIndex.fromValue(valueRoot(document, root));
  const afterIndex = DocumentIndex.fromValue(valueRoot(projected, root));
  const position = (from: number, assoc: -1 | 1) =>
    rootChange ? rootChange.mapPos(from, assoc) : from;
  const point = (at: Point, assoc: -1 | 1): Point | null => {
    const mapped = position(beforeIndex.positionAt(at), assoc);
    const landed = mapped === null ? null : afterIndex.pointAt(mapped, assoc);

    return landed && { ...landed, ...(root === 'main' ? {} : { root }) };
  };

  return {
    path: (path) => {
      const mapped = position(beforeIndex.nodeRange(path).from, 1);
      const entry = mapped === null ? null : afterIndex.nodeStartingAt(mapped);

      return entry ? [...entry.path] : null;
    },
    point,
    range: (range) => {
      const [start, end] = RangeApi.edges(range);
      const from = point(start, 1);
      const to = point(end, -1);

      if (!from || !to) return null;
      if (!RangeApi.isCollapsed(range) && PointApi.compare(from, to) >= 0) {
        return null;
      }

      return RangeApi.isBackward(range)
        ? { anchor: to, focus: from }
        : { anchor: from, focus: to };
    },
  };
};

/**
 * Map a range of a stored document onto one of its projections, or null when
 * the projection keeps none of its content.
 */
export const projectAuthoredRange = (
  document: EditorDocumentValue,
  projected: EditorDocumentValue,
  range: Range
): Range | null => {
  const before = document as JsonEditorValue;
  const after = projected as JsonEditorValue;

  if (before === after) return range;

  return authoredLocationMap(
    before,
    after,
    DocumentChange.between(before, after),
    range.anchor.root ?? 'main'
  ).range(range);
};
