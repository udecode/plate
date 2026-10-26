import type { AuthoredBlocksProjection } from '../core/authored-document-capability';
import {
  DocumentChange,
  getInternalDocumentRootChange,
  valueRoot,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import type { JsonRecord } from '../core/change/json';
import type { JsonEditorValue } from '../core/change/tokens';
import { ElementGenerationMaskedError } from '../core/editor-schema';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import type { AnyEditor, EditorDocumentValue } from '../interfaces/editor';
import type { Node } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { getDefined } from '../internal/get-defined';
import { indexAuthoredChanges } from './changes';
import { constructsValues } from './refusal';
import { authoredResolveSchemaOf } from './resolve-schema';
import {
  type AuthoredResolveSchema,
  projectAuthoredValue,
} from './tree/resolve';
import type {
  AuthoredDocumentProjection,
  AuthoredProjectionRefusal,
} from './types';

/** `proposed` accepts every pending change; `accepted` rejects every one. */
export type AuthoredFormatProjection = 'accepted' | 'proposed';

const projectionRefusal = (
  document: EditorDocumentValue,
  schema: CompiledEditorSchema
): AuthoredProjectionRefusal | null => {
  if (!constructsValues(schema)) return null;
  const pending = indexAuthoredChanges(document).changes.size;

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

  return projectAuthoredDocumentUnder(
    document,
    options.projection,
    options.editor ? authoredResolveSchemaOf(options.editor) : null
  );
}

const resolvedOrUncovered = (
  value: JsonEditorValue,
  projection: AuthoredFormatProjection,
  schema: AuthoredResolveSchema | null
) => {
  try {
    return projectAuthoredValue(value, projection, schema);
  } catch (error) {
    if (!(error instanceof ElementGenerationMaskedError)) throw error;

    return null;
  }
};

const uncoveredRefusal = (
  projection: AuthoredFormatProjection,
  pending: number
): AuthoredProjectionRefusal =>
  Object.freeze({
    diagnostics: Object.freeze([
      Object.freeze({
        code: 'authored-uncovered' as const,
        message: `The ${projection} projection builds an element that needs a generated value, and the document stores no spare block for it.`,
        severity: 'error' as const,
      }),
    ] as const),
    ok: false as const,
    pending,
  });

/**
 * The projection, or an `authored-uncovered` refusal when it builds an element
 * that needs a generated value and finds no spare block for it.
 *
 * @internal
 */
export const projectAuthoredDocumentUnder = (
  document: EditorDocumentValue,
  projection: AuthoredFormatProjection,
  schema: AuthoredResolveSchema | null
): AuthoredDocumentProjection | AuthoredProjectionRefusal => {
  const value = document as JsonEditorValue;
  const pending = indexAuthoredChanges(value).changes.size;
  const resolution = resolvedOrUncovered(value, projection, schema);

  if (!resolution) return uncoveredRefusal(projection, pending);

  return Object.freeze({
    diagnostics: Object.freeze([
      ...(pending === 0
        ? []
        : [
            Object.freeze({
              code: 'authored-lossy-projection' as const,
              message: `The ${projection} projection decides ${pending} pending change${
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
};

export type AuthoredLocationMap = Readonly<{
  path: (path: Path) => Path | null;
  point: (point: Point, assoc: -1 | 1) => Point | null;
  range: (range: Range) => Range | null;
}>;

/** Each map returns null for content the projection does not keep. */
export const locationMapOver = (
  beforeIndex: DocumentIndex,
  afterIndex: DocumentIndex,
  position: (from: number, assoc: -1 | 1) => number | null,
  root: string
): AuthoredLocationMap => {
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

export const authoredLocationMap = (
  document: JsonEditorValue,
  projected: JsonEditorValue,
  change: DocumentChange,
  root: string
): AuthoredLocationMap => {
  const rootChange = getInternalDocumentRootChange(change, root);

  return locationMapOver(
    DocumentIndex.fromValue(valueRoot(document, root)),
    DocumentIndex.fromValue(valueRoot(projected, root)),
    (from, assoc) => (rootChange ? rootChange.mapPos(from, assoc) : from),
    root
  );
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

type BlockNode = JsonRecord & {
  children?: readonly BlockNode[];
  text?: string;
};

const isLine = (node: BlockNode) =>
  node.children?.some((child) => typeof child.text === 'string') ?? false;

/**
 * The blocks at `paths` of `root` as one projection of the whole document
 * shows them, each once, in the projection's order. A block the projection
 * keeps reads as itself, and one it merges into the line before it, as a
 * pending join's right block, reads as that line. A block it removes, or
 * one in a root it removes with the root's owner, reads nothing.
 *
 * @internal
 */
export const projectAuthoredBlocks = (
  document: EditorDocumentValue,
  projection: AuthoredFormatProjection,
  schema: AuthoredResolveSchema | null,
  root: string,
  paths: readonly Path[]
): AuthoredBlocksProjection | AuthoredProjectionRefusal => {
  const value = document as JsonEditorValue;
  const resolution = resolvedOrUncovered(value, projection, schema);

  if (!resolution) {
    return uncoveredRefusal(
      projection,
      indexAuthoredChanges(value).changes.size
    );
  }

  const resolvedOf = resolution.resolvedIn(root);

  if (!resolvedOf) {
    return Object.freeze({ blocks: Object.freeze([]), ok: true as const });
  }

  const removed = new Set(
    (resolution.hiddenIn(root) ?? []).map(({ at }) => at.join(','))
  );
  const stored: Array<Readonly<{ node: BlockNode; path: Path }>> = [];
  const order = new Map<unknown, number>();
  const walk = (
    nodes: readonly BlockNode[],
    parent: Path,
    into: (node: BlockNode, path: Path) => void
  ) => {
    for (const [index, node] of nodes.entries()) {
      if (typeof node.text === 'string') continue;
      into(node, [...parent, index]);
      walk(node.children ?? [], [...parent, index], into);
    }
  };

  walk(valueRoot(value, root), [], (node, path) => stored.push({ node, path }));
  walk(valueRoot(resolution.value, root), [], (node) =>
    order.set(node, order.size)
  );

  const at = new Map(stored.map(({ path }, index) => [path.join(','), index]));
  const shownOf = (index: number): unknown => {
    const { node, path } = getDefined(stored[index]);
    const shown = resolvedOf(node);

    if (
      shown ||
      path.some((_, depth) => removed.has(path.slice(0, depth + 1).join(',')))
    ) {
      return shown;
    }

    // Lines between the pieces of a joined line merge or go with it.
    for (let before = index - 1; before >= 0; before -= 1) {
      const line = getDefined(stored[before]).node;
      const merged = isLine(line) ? resolvedOf(line) : null;

      if (merged) return merged;
    }

    return null;
  };
  const blocks = new Set<unknown>();

  for (const path of paths) {
    const index = at.get(path.join(','));
    const shown = index === undefined ? null : shownOf(index);

    if (shown !== null && order.has(shown)) blocks.add(shown);
  }

  return Object.freeze({
    blocks: Object.freeze(
      [...blocks].toSorted(
        (left, right) =>
          getDefined(order.get(left)) - getDefined(order.get(right))
      )
    ) as readonly Node[],
    ok: true as const,
  });
};
