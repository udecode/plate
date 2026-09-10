import type { Descendant, Path, Range } from '../core';

export type LegacyCommentRangeGroup = Readonly<{
  id: string;
  ranges: readonly Range[];
}>;

export type LegacyCommentDiagnostic =
  | Readonly<{ code: 'anonymous-comment'; path: Path }>
  | Readonly<{
      code: 'discontinuous-group';
      id: string;
      rangeCount: number;
    }>
  | Readonly<{
      code: 'invalid-range';
      id: string;
      path: Path;
      reason: 'empty-text' | 'non-boolean-mark' | 'non-text-node';
    }>
  | Readonly<{ code: 'missing-thread'; id: string }>
  | Readonly<{ code: 'orphan-id'; id: string; path: Path }>
  | Readonly<{ code: 'draft-only'; path: Path }>;

export type ExtractLegacyCommentRangesOptions = Readonly<{
  threadIds?: readonly string[] | ReadonlySet<string>;
}>;

export type ExtractLegacyCommentRangesResult = Readonly<{
  comments: readonly LegacyCommentRangeGroup[];
  diagnostics: readonly LegacyCommentDiagnostic[];
  document: readonly Descendant[];
}>;

type LegacySegment = Readonly<{
  id: string;
  index: number;
  path: Path;
  textLength: number;
}>;

const COMMENT_PREFIX = 'comment_';
const DRAFT_KEY = 'comment_draft';
const TRANSIENT_KEY = 'commentTransient';

const isLegacyCommentProperty = (key: string) =>
  key === 'comment' || key === TRANSIENT_KEY || key.startsWith(COMMENT_PREFIX);

/**
 * Extracts legacy document comment marks for an offline application migration.
 * The returned document contains no live comment compatibility properties.
 */
export const extractLegacyCommentRanges = (
  document: readonly Descendant[],
  options: ExtractLegacyCommentRangesOptions = {}
): ExtractLegacyCommentRangesResult => {
  const diagnostics: LegacyCommentDiagnostic[] = [];
  const firstSeenIds: string[] = [];
  const seenIds = new Set<string>();
  const segments: LegacySegment[] = [];
  let textIndex = 0;

  const recordId = (id: string) => {
    if (seenIds.has(id)) return;

    seenIds.add(id);
    firstSeenIds.push(id);
  };
  const sanitizeNode = (node: Descendant, path: Path): Descendant => {
    const record = node as unknown as Readonly<Record<string, unknown>>;
    const idEntries = Object.entries(record).filter(
      ([key]) => key.startsWith(COMMENT_PREFIX) && key !== DRAFT_KEY
    );
    const validIds = idEntries.flatMap(([key, value]) => {
      const id = key.slice(COMMENT_PREFIX.length);

      if (value !== true) {
        if (value !== false && value !== undefined) {
          diagnostics.push({
            code: 'invalid-range',
            id,
            path,
            reason: 'non-boolean-mark',
          });
        }

        return [];
      }

      recordId(id);

      return [id];
    });
    const text = typeof record.text === 'string' ? record.text : null;
    const hasBaseMark = record.comment === true;
    const hasDraftMark = record[DRAFT_KEY] === true;

    if (text !== null) {
      if (hasBaseMark && validIds.length === 0) {
        diagnostics.push({
          code: hasDraftMark ? 'draft-only' : 'anonymous-comment',
          path,
        });
      }

      for (const id of validIds) {
        if (!hasBaseMark) {
          diagnostics.push({ code: 'orphan-id', id, path });
        }
        if (text.length === 0) {
          diagnostics.push({
            code: 'invalid-range',
            id,
            path,
            reason: 'empty-text',
          });
          continue;
        }

        segments.push({
          id,
          index: textIndex,
          path,
          textLength: text.length,
        });
      }

      textIndex += 1;
    } else {
      for (const id of validIds) {
        diagnostics.push({
          code: 'invalid-range',
          id,
          path,
          reason: 'non-text-node',
        });
      }
    }

    const sanitized = Object.fromEntries(
      Object.entries(record).filter(([key]) => !isLegacyCommentProperty(key))
    ) as Record<string, unknown>;

    if (Array.isArray(record.children)) {
      sanitized.children = record.children.map((child, index) =>
        sanitizeNode(child as Descendant, [...path, index])
      );
    }

    return sanitized as Descendant;
  };
  const sanitizedDocument = document.map((node, index) =>
    sanitizeNode(node, [index])
  );
  const rangesById = new Map<
    string,
    Array<{ lastTextIndex: number; range: Range }>
  >();

  for (const segment of segments) {
    const groups = rangesById.get(segment.id) ?? [];
    const previous = groups.at(-1);

    if (previous && previous.lastTextIndex + 1 === segment.index) {
      previous.lastTextIndex = segment.index;
      previous.range = {
        anchor: previous.range.anchor,
        focus: { offset: segment.textLength, path: segment.path },
      };
    } else {
      groups.push({
        lastTextIndex: segment.index,
        range: {
          anchor: { offset: 0, path: segment.path },
          focus: { offset: segment.textLength, path: segment.path },
        },
      });
    }

    rangesById.set(segment.id, groups);
  }

  const comments = firstSeenIds.flatMap((id) => {
    const groups = rangesById.get(id);

    if (!groups || groups.length === 0) return [];
    if (groups.length > 1) {
      diagnostics.push({
        code: 'discontinuous-group',
        id,
        rangeCount: groups.length,
      });
    }

    return [{ id, ranges: groups.map(({ range }) => range) }];
  });
  const threadIds = options.threadIds ? new Set(options.threadIds) : undefined;

  if (threadIds) {
    firstSeenIds.forEach((id) => {
      if (!threadIds.has(id)) diagnostics.push({ code: 'missing-thread', id });
    });
  }

  return {
    comments,
    diagnostics,
    document: sanitizedDocument,
  };
};
