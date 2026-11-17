import type { Descendant, Path, Range } from '../core';
import { V53_VOID_ELEMENT_TYPES } from './v53-manifest.internal';

/** One problem the extractor found in a thread's legacy comment marks. */
export type LegacyCommentReportRow =
  | Readonly<{ code: 'anonymous-comment'; path: Path }>
  | Readonly<{ code: 'draft-only'; path: Path }>
  | Readonly<{
      code: 'invalid-range';
      id: string;
      path: Path;
      reason:
        | 'caption-text'
        | 'empty-text'
        | 'non-boolean-mark'
        | 'non-text-node';
    }>
  | Readonly<{ code: 'missing-thread'; id: string }>
  | Readonly<{ code: 'orphan-id'; id: string; path: Path }>
  /** Unmarked visible text split the thread into these ranges, in order. */
  | Readonly<{ code: 'split-group'; id: string; ranges: readonly Range[] }>;

/** Stored thread ids, so a marked id without a thread is reported. */
export type ExtractLegacyCommentRangesOptions = Readonly<{
  threadIds?: readonly string[] | ReadonlySet<string>;
}>;

/**
 * The sanitized document, one range per thread id into it, ready for
 * `migrateDocument`'s `ranges`, and every mark problem found.
 */
export type ExtractLegacyCommentRangesResult = Readonly<{
  document: readonly Descendant[];
  ranges: Readonly<Record<string, Range>>;
  report: readonly LegacyCommentReportRow[];
}>;

type LegacySegment = Readonly<{
  id: string;
  path: Path;
  textLength: number;
  visibleAfter: number;
  visibleBefore: number;
}>;

const COMMENT_PREFIX = 'comment_';
const DRAFT_KEY = 'comment_draft';
const TRANSIENT_KEY = 'commentTransient';

const isLegacyCommentProperty = (key: string) =>
  key === 'comment' || key === TRANSIENT_KEY || key.startsWith(COMMENT_PREFIX);

const withoutLegacyProperties = (record: Readonly<Record<string, unknown>>) =>
  Object.fromEntries(
    Object.entries(record).filter(([key]) => !isLegacyCommentProperty(key))
  ) as Record<string, unknown>;

/**
 * Extracts legacy document comment marks for an offline application migration.
 * The returned document contains no live comment compatibility properties, and
 * each range points into it, so pass both to one `migrateDocument` call.
 */
export const extractLegacyCommentRanges = (
  document: readonly Descendant[],
  options: ExtractLegacyCommentRangesOptions = {}
): ExtractLegacyCommentRangesResult => {
  const report: LegacyCommentReportRow[] = [];
  const firstSeenIds: string[] = [];
  const seenIds = new Set<string>();
  const segments: LegacySegment[] = [];
  let visibleTextCount = 0;

  const recordId = (id: string) => {
    if (seenIds.has(id)) return;

    seenIds.add(id);
    firstSeenIds.push(id);
  };
  const sanitizeNode = (
    node: Descendant,
    path: Path,
    insideVoid: boolean,
    inCaption = false
  ): Descendant => {
    const record = node as unknown as Readonly<Record<string, unknown>>;
    const idEntries = Object.entries(record).filter(
      ([key]) => key.startsWith(COMMENT_PREFIX) && key !== DRAFT_KEY
    );
    const validIds = idEntries.flatMap(([key, value]) => {
      const id = key.slice(COMMENT_PREFIX.length);

      if (value !== true) {
        if (value !== false && value !== undefined) {
          report.push({
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
      const visibleBefore = visibleTextCount;

      if (!insideVoid && !inCaption && text.length > 0) visibleTextCount += 1;
      if (hasBaseMark && validIds.length === 0) {
        report.push({
          code: hasDraftMark ? 'draft-only' : 'anonymous-comment',
          path,
        });
      }

      for (const id of validIds) {
        if (!hasBaseMark) {
          report.push({ code: 'orphan-id', id, path });
        }
        if (inCaption || text.length === 0) {
          report.push({
            code: 'invalid-range',
            id,
            path,
            reason: inCaption ? 'caption-text' : 'empty-text',
          });
          continue;
        }

        segments.push({
          id,
          path,
          textLength: text.length,
          visibleAfter: visibleTextCount,
          visibleBefore,
        });
      }
    } else {
      for (const id of validIds) {
        report.push({
          code: 'invalid-range',
          id,
          path,
          reason: 'non-text-node',
        });
      }
    }

    const sanitized = withoutLegacyProperties(record);

    if (Array.isArray(record.caption)) {
      sanitized.caption = record.caption.map((captionNode) =>
        sanitizeNode(captionNode as Descendant, path, insideVoid, true)
      );
    }
    if (Array.isArray(record.children)) {
      const childrenInsideVoid =
        insideVoid ||
        (typeof record.type === 'string' &&
          V53_VOID_ELEMENT_TYPES.has(record.type));

      sanitized.children = record.children.map((child, index) =>
        sanitizeNode(
          child as Descendant,
          inCaption ? path : [...path, index],
          childrenInsideVoid,
          inCaption
        )
      );
    }

    return sanitized as Descendant;
  };
  const sanitizedDocument = document.map((node, index) =>
    sanitizeNode(node, [index], false)
  );
  const rangesById = new Map<
    string,
    Array<{ range: Range; visibleAfter: number }>
  >();

  for (const segment of segments) {
    const groups = rangesById.get(segment.id) ?? [];
    const previous = groups.at(-1);

    if (previous && previous.visibleAfter === segment.visibleBefore) {
      previous.visibleAfter = segment.visibleAfter;
      previous.range = {
        anchor: previous.range.anchor,
        focus: { offset: segment.textLength, path: segment.path },
      };
    } else {
      groups.push({
        visibleAfter: segment.visibleAfter,
        range: {
          anchor: { offset: 0, path: segment.path },
          focus: { offset: segment.textLength, path: segment.path },
        },
      });
    }

    rangesById.set(segment.id, groups);
  }

  // A null prototype keeps a thread id such as "__proto__" as its own key.
  const ranges: Record<string, Range> = Object.create(null);

  for (const id of firstSeenIds) {
    const groups = rangesById.get(id);

    if (!groups) continue;
    if (groups.length > 1) {
      report.push({
        code: 'split-group',
        id,
        ranges: groups.map((group) => group.range),
      });
    } else {
      ranges[id] = groups[0].range;
    }
  }

  const threadIds = options.threadIds ? new Set(options.threadIds) : undefined;

  if (threadIds) {
    firstSeenIds.forEach((id) => {
      if (!threadIds.has(id)) report.push({ code: 'missing-thread', id });
    });
  }

  return { document: sanitizedDocument, ranges, report };
};
