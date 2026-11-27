import {
  type Anchor,
  type Editor,
  type EditorDocumentValue,
  ElementApi,
  type Path,
  PointApi,
  type Range,
  RangeApi,
  TextApi,
} from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import { BaseCommentsPlugin, type CommentData } from 'platejs/comments';
import { BaseInkPlugin, type InkMark, type InkPassage } from 'platejs/ink';
import { type InkPassageImages, InkPlugin } from 'platejs/ink/react';

import type {
  InkDigitizeCorrection,
  InkDigitizeEdit,
  InkDigitizeMeaning,
  InkDigitizeReading,
  InkDigitizeRequest,
} from '@/registry/app/api/ai/ink-digitize/ink-digitize-route';

export const INK_DIGITIZE_MAX_WORDS = 1000;
export const INK_DIGITIZE_MAX_SIDE = 2048;

const VOID_CHAR = String.fromCodePoint(0xff_fc);
const ATTACHED_PUNCT_RE = /^[.,!?;:)\]}]+$/;
const PUNCT_ONLY_RE = /^[\p{P}\p{S}]+$/u;

const requestCounters = new WeakMap<object, number>();
const latestRequests = new WeakMap<object, string>();

export const nextInkDigitizeRequestId = (view: Editor): string => {
  const next = (requestCounters.get(view) ?? 0) + 1;

  requestCounters.set(view, next);
  const id = `r${next}`;

  latestRequests.set(view, id);

  return id;
};

export const latestInkDigitizeRequestId = (view: Editor): string | undefined =>
  latestRequests.get(view);

export const canDigitizeInk = (view: Editor): boolean => {
  if (view.read.view.isReadOnly()) return false;
  if (view.plugin(AuthoredPlugin).installed) {
    const authoredView = view.plugin(AuthoredPlugin).read.view();

    if ('preview' in authoredView) return false;
  }

  return true;
};

export type PreparedPassageMeta = Readonly<{
  blockId: string;
  copy: string;
  id: string;
  passage: InkPassage;
  words: readonly string[];
}>;

export type PreparedInkDigitize = Readonly<{
  blockOrder: readonly string[];
  extraMarkIds: readonly string[];
  lassoedMarkIds: readonly string[];
  marginNoteIds: readonly string[];
  markIdByKey: ReadonlyMap<string, string>;
  markKeyById: ReadonlyMap<string, string>;
  passages: readonly PreparedPassageMeta[];
  request: Omit<
    InkDigitizeRequest,
    'apiKey' | 'correction' | 'instruction' | 'model'
  >;
  shownByBlock: ReadonlyMap<string, readonly string[]>;
}>;

export type PrepareInkDigitizeResult =
  | Readonly<{ kind: 'blocked'; reason: 'no-marks' | 'read-only-or-preview' }>
  | Readonly<{
      kind: 'margin-only';
      marginNoteIds: readonly string[];
    }>
  | Readonly<{
      canRetryLassoOnly: boolean;
      kind: 'too-many-words';
      marginNoteIds: readonly string[];
      signMarkIds: readonly string[];
      wordCount: number;
    }>
  | Readonly<{
      kind: 'passage-too-large';
      marginNoteIds: readonly string[];
      markIds: readonly string[];
    }>
  | Readonly<{
      kind: 'ready';
      prepared: PreparedInkDigitize;
    }>;

const isUnanchoredMark = (mark: InkMark) =>
  mark.margin === undefined && mark.blocks.every((b) => b.runs.length === 0);

const blockIdsBetween = (
  view: Editor,
  targetBlockIds: ReadonlySet<string>
): readonly string[] => {
  const allBlocks: Array<{ id: string; path: Path }> = [];

  for (const [node, path] of view.read.nodes.blocks({
    at: [],
    mode: 'lowest',
  })) {
    if (ElementApi.isElement(node) && typeof node.id === 'string') {
      allBlocks.push({ id: node.id, path });
    }
  }

  let first = -1;
  let last = -1;

  for (const [index, entry] of allBlocks.entries()) {
    if (targetBlockIds.has(entry.id)) {
      if (first === -1) first = index;
      last = index;
    }
  }
  if (first === -1) return [];

  return allBlocks.slice(first, last + 1).map((entry) => entry.id);
};

const shownMarkIdsByBlock = (
  view: Editor,
  blockIds: ReadonlySet<string>
): Map<string, readonly string[]> => {
  const { read } = view.plugin(BaseInkPlugin);
  const byBlock = new Map<string, string[]>();

  for (const blockId of blockIds) byBlock.set(blockId, []);
  for (const mark of read.shownMarks()) {
    if (isUnanchoredMark(mark)) continue;
    const seen = new Set<string>();

    for (const block of mark.blocks) {
      const copy = read.copy(block.copy);

      if (!copy || !blockIds.has(copy.block) || seen.has(copy.block)) continue;
      seen.add(copy.block);
      byBlock.get(copy.block)?.push(mark.id);
    }
  }
  for (const list of byBlock.values()) list.sort();

  return byBlock;
};

const totalWordsOf = (passages: readonly InkPassage[]) =>
  passages.reduce((sum, passage) => sum + passage.words.length, 0);

export const prepareInkDigitizeRequest = async (
  view: Editor,
  pickedIds: readonly string[],
  options: Readonly<{
    lassoOnly?: boolean;
    maxSide?: number;
    maxWords?: number;
    renderImages?: (
      passages: readonly InkPassage[],
      options: Readonly<{ maxSide: number }>
    ) => Promise<ReadonlyArray<InkPassageImages | null>>;
  }> = {}
): Promise<PrepareInkDigitizeResult> => {
  if (!canDigitizeInk(view)) {
    return { kind: 'blocked', reason: 'read-only-or-preview' };
  }

  const maxSide = options.maxSide ?? INK_DIGITIZE_MAX_SIDE;
  const maxWords = options.maxWords ?? INK_DIGITIZE_MAX_WORDS;
  const ink = view.plugin(InkPlugin);
  const shown = ink.read.shownMarks();
  const shownById = new Map(shown.map((mark) => [mark.id, mark]));
  const pickedMarks = [...new Set(pickedIds)]
    .map((id) => shownById.get(id))
    .filter((mark): mark is InkMark => mark !== undefined);

  if (pickedMarks.length === 0) {
    return { kind: 'blocked', reason: 'no-marks' };
  }

  const marginNoteIds: string[] = [];
  const readablePicked = pickedMarks.filter((mark) => !isUnanchoredMark(mark));

  if (readablePicked.length === 0) {
    return { kind: 'blocked', reason: 'no-marks' };
  }

  const lassoedSet = new Set(readablePicked.map((mark) => mark.id));
  const touchedBlocks = new Set<string>();

  for (const mark of readablePicked) {
    for (const block of mark.blocks) {
      const copy = ink.read.copy(block.copy);

      if (copy) touchedBlocks.add(copy.block);
    }
  }

  const widenedMarks = shown.filter(
    (mark) =>
      !isUnanchoredMark(mark) &&
      mark.blocks.some((block) => {
        const copy = ink.read.copy(block.copy);

        return copy !== undefined && touchedBlocks.has(copy.block);
      })
  );
  const extraMarkIds = widenedMarks
    .filter((mark) => !lassoedSet.has(mark.id))
    .map((mark) => mark.id);
  const targetIds = options.lassoOnly
    ? readablePicked.map((mark) => mark.id)
    : widenedMarks.map((mark) => mark.id);

  const passages = ink.read.passages(targetIds);

  if (passages.length === 0) {
    return { kind: 'blocked', reason: 'no-marks' };
  }

  const wordCount = totalWordsOf(passages);

  if (wordCount > maxWords) {
    const lassoOnlyWords = options.lassoOnly
      ? wordCount
      : totalWordsOf(ink.read.passages(readablePicked.map((mark) => mark.id)));

    return {
      canRetryLassoOnly:
        !options.lassoOnly &&
        extraMarkIds.length > 0 &&
        lassoOnlyWords <= maxWords,
      kind: 'too-many-words',
      marginNoteIds,
      signMarkIds: options.lassoOnly ? [] : extraMarkIds,
      wordCount,
    };
  }

  const pictures = await (options.renderImages
    ? options.renderImages(passages, { maxSide })
    : ink.api.images(passages, { maxSide }));
  const oversizedIndex = pictures.indexOf(null);

  if (oversizedIndex !== -1) {
    return {
      kind: 'passage-too-large',
      marginNoteIds,
      markIds: passages[oversizedIndex].marks.map((mark) => mark.id),
    };
  }

  const markKeyById = new Map<string, string>();
  const markIdByKey = new Map<string, string>();
  const keyOf = (markId: string) => {
    let key = markKeyById.get(markId);

    if (!key) {
      key = `k${markKeyById.size}`;
      markKeyById.set(markId, key);
      markIdByKey.set(key, markId);
    }

    return key;
  };

  const passageMetas: PreparedPassageMeta[] = [];
  const requestPassages: InkDigitizeRequest['passages'] = [];
  const passageBlocks = new Set<string>();

  for (const [index, passage] of passages.entries()) {
    const pic = pictures[index] as InkPassageImages;
    const copy = ink.read.copy(passage.copy);

    if (!copy) continue;
    passageBlocks.add(copy.block);

    const id = `p${index}`;
    const words = passage.words.map(({ end, start }) => {
      const raw = passage.text.slice(
        start - passage.start,
        end - passage.start
      );

      return raw === VOID_CHAR ? (pic.voids[start] ?? '') : raw;
    });

    passageMetas.push({
      blockId: copy.block,
      copy: passage.copy,
      id,
      passage,
      words,
    });
    requestPassages.push({
      id,
      images: {
        inkAlone: pic.inkAlone,
        inkOnText: pic.inkOnText,
      },
      marks: passage.marks.map((mark) => ({
        box: [...(pic.boxes[mark.id] ?? [0, 0, 0, 0])] as [
          number,
          number,
          number,
          number,
        ],
        ...(mark.gaps.length > 0 ? { gaps: [...mark.gaps] } : {}),
        id: keyOf(mark.id),
        ...(mark.margin ? { margin: mark.margin } : {}),
        ...(mark.words.length > 0 ? { words: [...mark.words] } : {}),
      })),
      words,
    });
  }

  const requestId = nextInkDigitizeRequestId(view);

  return {
    kind: 'ready',
    prepared: {
      blockOrder: blockIdsBetween(view, passageBlocks),
      extraMarkIds: options.lassoOnly ? [] : extraMarkIds,
      lassoedMarkIds: [...lassoedSet],
      marginNoteIds,
      markIdByKey,
      markKeyById,
      passages: passageMetas,
      request: {
        passages: requestPassages,
        request: requestId,
      },
      shownByBlock: shownMarkIdsByBlock(view, passageBlocks),
    },
  };
};

export type ValidatedCorrection = Readonly<{
  defaultKept: boolean;
  markIds: readonly string[];
  markKeys: readonly string[];
  meanings: readonly InkDigitizeMeaning[];
}>;

export type ValidatedDigitizeReading =
  | Readonly<{
      corrections: readonly ValidatedCorrection[];
      ok: true;
      request: string;
    }>
  | Readonly<{
      ok: false;
      reason:
        | 'cross-passage-order'
        | 'duplicate-mark'
        | 'interleaved-corrections'
        | 'overlapping-edits'
        | 'stale-request'
        | 'unknown-reference';
    }>;

const editSpan = (edit: InkDigitizeEdit): readonly [number, number] =>
  edit.kind === 'insert'
    ? [edit.gap, edit.gap]
    : [edit.words[0], edit.words[1]];

const editsOverlap = (a: InkDigitizeEdit, b: InkDigitizeEdit): boolean => {
  if (a.passage !== b.passage) return false;
  if (a.kind === 'insert' && b.kind === 'insert') return a.gap === b.gap;
  if (a.kind === 'insert' && b.kind !== 'insert') {
    return b.words[0] < a.gap && a.gap <= b.words[1];
  }
  if (b.kind === 'insert' && a.kind !== 'insert') {
    return a.words[0] < b.gap && b.gap <= a.words[1];
  }

  const [a0, a1] = editSpan(a);
  const [b0, b1] = editSpan(b);

  return a0 <= b1 && b0 <= a1;
};

const editPos = (edit: InkDigitizeEdit): number =>
  edit.kind === 'insert' ? edit.gap * 2 : edit.words[0] * 2 + 1;

const editEndPos = (edit: InkDigitizeEdit): number =>
  edit.kind === 'insert' ? edit.gap * 2 : edit.words[1] * 2 + 1;

const quoteMatches = (
  meta: PreparedPassageMeta,
  start: number,
  end: number,
  quote: string
): boolean => {
  if (start > end || end >= meta.words.length) return false;
  const joined = meta.words.slice(start, end + 1).join(' ');

  if (quote === joined) return true;

  const wStart = meta.passage.words[start].start - meta.passage.start;
  const wEnd = meta.passage.words[end].end - meta.passage.start;
  let compact = '';
  let cursor = wStart;

  for (let i = start; i <= end; i += 1) {
    const ws = meta.passage.words[i].start - meta.passage.start;
    const we = meta.passage.words[i].end - meta.passage.start;

    compact += meta.passage.text.slice(cursor, ws);
    compact += meta.words[i];
    cursor = we;
  }
  compact += meta.passage.text.slice(cursor, wEnd);

  return quote === compact;
};

const editTouchesCorrectionMarks = (
  edit: InkDigitizeEdit,
  passage: InkDigitizeRequest['passages'][number],
  markKeySet: ReadonlySet<string>
): boolean => {
  const relevantMarks = passage.marks.filter((mark) => markKeySet.has(mark.id));

  if (relevantMarks.length === 0) return false;
  if (edit.kind === 'insert') {
    return relevantMarks.some(
      (mark) =>
        (mark.gaps ?? []).includes(edit.gap) ||
        (mark.words ?? []).some((w) => w === edit.gap - 1 || w === edit.gap)
    );
  }

  const [start, end] = edit.words;

  if (
    (edit.kind === 'comment' || edit.kind === 'answer') &&
    relevantMarks.some((mark) => mark.margin !== undefined)
  ) {
    return true;
  }

  return relevantMarks.some(
    (mark) =>
      (mark.words ?? []).some((w) => w >= start && w <= end) ||
      (mark.gaps ?? []).some((g) => g >= start && g <= end + 1)
  );
};

const checkCorrectionsOrderAndOverlap = (
  corrections: readonly InkDigitizeCorrection[]
):
  | null
  | 'cross-passage-order'
  | 'interleaved-corrections'
  | 'overlapping-edits' => {
  const spansByPassage = new Map<
    string,
    Array<{ correction: number; max: number; min: number }>
  >();

  for (const [cIndex, correction] of corrections.entries()) {
    const primary = correction.meanings[0];

    if (!primary) continue;
    for (const meaning of correction.meanings) {
      for (let i = 0; i < meaning.edits.length; i += 1) {
        for (let j = i + 1; j < meaning.edits.length; j += 1) {
          if (editsOverlap(meaning.edits[i], meaning.edits[j])) {
            return 'overlapping-edits';
          }
        }
      }
    }

    const perPassage = new Map<string, { edits: InkDigitizeEdit[] }>();

    for (const edit of primary.edits) {
      const bucket = perPassage.get(edit.passage) ?? { edits: [] };

      bucket.edits.push(edit);
      perPassage.set(edit.passage, bucket);
    }
    for (const [passageId, { edits }] of perPassage) {
      const list = spansByPassage.get(passageId) ?? [];

      list.push({
        correction: cIndex,
        max: Math.max(...edits.map(editEndPos)),
        min: Math.min(...edits.map(editPos)),
      });
      spansByPassage.set(passageId, list);
    }
  }

  for (let i = 0; i < corrections.length; i += 1) {
    const editsA = corrections[i].meanings[0]?.edits ?? [];

    for (let j = i + 1; j < corrections.length; j += 1) {
      const editsB = corrections[j].meanings[0]?.edits ?? [];

      for (const a of editsA) {
        for (const b of editsB) {
          if (editsOverlap(a, b)) return 'overlapping-edits';
        }
      }
    }
  }

  const pairOrder = new Map<string, number>();

  for (const spans of spansByPassage.values()) {
    for (let i = 0; i < spans.length; i += 1) {
      for (let j = i + 1; j < spans.length; j += 1) {
        const a = spans[i];
        const b = spans[j];

        if (a.min < b.max && b.min < a.max) {
          return 'interleaved-corrections';
        }

        const dir = a.max <= b.min ? -1 : 1;
        const pairKey =
          a.correction < b.correction
            ? `${a.correction}:${b.correction}`
            : `${b.correction}:${a.correction}`;
        const normalizedDir = a.correction < b.correction ? dir : -dir;
        const prev = pairOrder.get(pairKey);

        if (prev !== undefined && prev !== normalizedDir) {
          return 'cross-passage-order';
        }
        pairOrder.set(pairKey, normalizedDir);
      }
    }
  }

  return null;
};

export const validateInkDigitizeReading = (
  prepared: PreparedInkDigitize,
  reading: InkDigitizeReading,
  latestRequestId: string | undefined
): ValidatedDigitizeReading => {
  if (
    reading.request !== prepared.request.request ||
    (latestRequestId !== undefined && reading.request !== latestRequestId)
  ) {
    return { ok: false, reason: 'stale-request' };
  }

  const metaById = new Map(prepared.passages.map((meta) => [meta.id, meta]));
  const reqPassageById = new Map(
    prepared.request.passages.map((passage) => [passage.id, passage])
  );
  const lassoedSet = new Set(prepared.lassoedMarkIds);
  const usedMarks = new Set<string>();
  const keptRaw: InkDigitizeCorrection[] = [];
  const validated: ValidatedCorrection[] = [];

  for (const correction of reading.corrections) {
    const markIds: string[] = [];

    for (const key of correction.marks) {
      const markId = prepared.markIdByKey.get(key);

      if (!markId) return { ok: false, reason: 'unknown-reference' };
      if (usedMarks.has(key)) return { ok: false, reason: 'duplicate-mark' };
      usedMarks.add(key);
      markIds.push(markId);
    }

    const keySet = new Set(correction.marks);
    const validMeanings: InkDigitizeMeaning[] = [];

    for (const meaning of correction.meanings) {
      let ok = true;

      for (const edit of meaning.edits) {
        const meta = metaById.get(edit.passage);
        const reqPassage = reqPassageById.get(edit.passage);

        if (!meta || !reqPassage) {
          return { ok: false, reason: 'unknown-reference' };
        }
        if (!editTouchesCorrectionMarks(edit, reqPassage, keySet)) {
          ok = false;
          break;
        }
        if (edit.kind === 'insert') {
          if (edit.gap > meta.words.length) {
            return { ok: false, reason: 'unknown-reference' };
          }
          const expectedBefore = meta.words[edit.gap - 1] ?? '';
          const expectedAfter = meta.words[edit.gap] ?? '';

          if (
            edit.between[0] !== expectedBefore ||
            edit.between[1] !== expectedAfter
          ) {
            ok = false;
            break;
          }
        } else if (
          !quoteMatches(meta, edit.words[0], edit.words[1], edit.quote)
        ) {
          ok = false;
          break;
        }
      }

      if (ok) validMeanings.push(meaning);
    }

    if (validMeanings.length === 0) continue;

    keptRaw.push({ marks: correction.marks, meanings: validMeanings });
    validated.push({
      defaultKept: markIds.some((id) => lassoedSet.has(id)),
      markIds,
      markKeys: correction.marks,
      meanings: validMeanings,
    });
  }

  const orderIssue = checkCorrectionsOrderAndOverlap(keptRaw);

  if (orderIssue) return { ok: false, reason: orderIssue };

  return {
    corrections: validated,
    ok: true,
    request: reading.request,
  };
};

export const marksTurningIntoSigns = (
  prepared: PreparedInkDigitize,
  corrections: readonly ValidatedCorrection[],
  keptIndices: ReadonlySet<number>,
  meaningIndices?: ReadonlyMap<number, number>
): readonly string[] => {
  const metaById = new Map(prepared.passages.map((meta) => [meta.id, meta]));
  const changedBlocks = new Set<string>();

  for (const [index, correction] of corrections.entries()) {
    if (!keptIndices.has(index)) continue;
    const meaning = correction.meanings[meaningIndices?.get(index) ?? 0];

    if (!meaning) continue;
    for (const edit of meaning.edits) {
      if (
        edit.kind === 'highlight' ||
        edit.kind === 'comment' ||
        edit.kind === 'answer'
      ) {
        continue;
      }
      const meta = metaById.get(edit.passage);

      if (meta) changedBlocks.add(meta.blockId);
    }
  }

  if (changedBlocks.size === 0) return [];

  const keptMarks = new Set<string>();

  for (const [index, correction] of corrections.entries()) {
    if (keptIndices.has(index)) {
      for (const id of correction.markIds) keptMarks.add(id);
    }
  }

  const affected = new Set<string>();

  for (const blockId of changedBlocks) {
    for (const markId of prepared.shownByBlock.get(blockId) ?? []) {
      if (!keptMarks.has(markId)) affected.add(markId);
    }
  }

  return [...affected];
};

type ResolvedEdit = Readonly<{
  charEnd: number;
  charStart: number;
  copy: string;
  edit: InkDigitizeEdit;
  insertText?: string;
  passageIndex: number;
  range: Range;
}>;

const resolveEditSpan = (
  copyText: string,
  meta: PreparedPassageMeta,
  edit: InkDigitizeEdit
): { charEnd: number; charStart: number; insertText?: string } => {
  if (edit.kind === 'insert') {
    const prev = edit.gap > 0 ? meta.passage.words[edit.gap - 1] : undefined;
    const next =
      edit.gap < meta.passage.words.length
        ? meta.passage.words[edit.gap]
        : undefined;
    const atOffset = prev ? prev.end : (next?.start ?? meta.passage.start);
    const trimmed = edit.text.trim();

    if (trimmed.length === 0) {
      return { charEnd: atOffset, charStart: atOffset, insertText: '' };
    }

    const leftCh = atOffset > 0 ? copyText[atOffset - 1] : '';
    const rightCh = atOffset < copyText.length ? copyText[atOffset] : '';
    const startsWithAttachedPunct = ATTACHED_PUNCT_RE.test(trimmed[0]);
    const endsWithSpaceOrOpen = /[\s([{]$/.test(trimmed);
    const leftIsWord = leftCh !== '' && !/\s/.test(leftCh);
    const rightIsWord =
      rightCh !== '' && !/\s/.test(rightCh) && !ATTACHED_PUNCT_RE.test(rightCh);
    const needLead = leftIsWord && !startsWithAttachedPunct;
    const needTrail = rightIsWord && !endsWithSpaceOrOpen;

    return {
      charEnd: atOffset,
      charStart: atOffset,
      insertText: `${needLead ? ' ' : ''}${trimmed}${needTrail ? ' ' : ''}`,
    };
  }

  const charStart = meta.passage.words[edit.words[0]].start;
  const charEnd = meta.passage.words[edit.words[1]].end;

  if (edit.kind === 'delete') {
    const deletedSlice = copyText.slice(charStart, charEnd);
    let afterSpaceEnd = charEnd;

    while (
      afterSpaceEnd < copyText.length &&
      /\s/.test(copyText[afterSpaceEnd])
    ) {
      afterSpaceEnd += 1;
    }

    let beforeSpaceStart = charStart;

    while (beforeSpaceStart > 0 && /\s/.test(copyText[beforeSpaceStart - 1])) {
      beforeSpaceStart -= 1;
    }

    const hasSpaceAfter = afterSpaceEnd > charEnd;
    const hasSpaceBefore = beforeSpaceStart < charStart;
    const charAfterSpaces = copyText[afterSpaceEnd] ?? '';
    const followsPunctOrEnd =
      afterSpaceEnd === copyText.length ||
      ATTACHED_PUNCT_RE.test(charAfterSpaces);
    const deletingPunctAfterWord =
      PUNCT_ONLY_RE.test(deletedSlice) &&
      !hasSpaceBefore &&
      charStart > 0 &&
      !/\s/.test(copyText[charStart - 1]);

    if (deletingPunctAfterWord) {
      return { charEnd, charStart };
    }
    if (!followsPunctOrEnd && hasSpaceAfter) {
      return { charEnd: afterSpaceEnd, charStart };
    }
    if (hasSpaceBefore) {
      return { charEnd, charStart: beforeSpaceStart };
    }

    return { charEnd, charStart };
  }

  return { charEnd, charStart };
};

const rangesOverlapPending = (
  at: Range,
  pending: readonly Range[]
): boolean => {
  const [aStart, aEnd] = RangeApi.edges(at);
  const collapsed = PointApi.equals(aStart, aEnd);

  for (const range of pending) {
    const [bStart, bEnd] = RangeApi.edges(range);

    if (collapsed) {
      if (
        PointApi.compare(bStart, aStart) < 0 &&
        PointApi.compare(aStart, bEnd) < 0
      ) {
        return true;
      }
    } else if (
      PointApi.compare(aStart, bEnd) < 0 &&
      PointApi.compare(bStart, aEnd) < 0
    ) {
      return true;
    }
  }

  return false;
};

export type ConfirmChoice = Readonly<{
  correctionIndex: number;
  meaningIndex: number;
}>;

export type ConfirmSkipReason =
  | 'no-comments-plugin'
  | 'no-op'
  | 'pending-suggestion'
  | 'refused'
  | 'save-failed'
  | 'save-rejected';

export type ConfirmInkDigitizeResult =
  | Readonly<{
      applied: ReadonlyArray<{
        correctionIndex: number;
        markIds: readonly string[];
        threadIds?: readonly string[];
      }>;
      skipped: ReadonlyArray<{
        correctionIndex: number;
        markIds: readonly string[];
        reason: ConfirmSkipReason;
      }>;
      status: 'applied';
    }>
  | Readonly<{
      reason: 'read-only-or-preview' | 'stale-request';
      status: 'blocked';
    }>
  | Readonly<{
      status: 'stale';
    }>;

class NoOpRollbackError extends Error {
  override name = 'NoOpRollbackError';
}

const sameTextMarks = (
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean => {
  const keysA = Object.keys(a).filter((k) => k !== 'text');
  const keysB = Object.keys(b).filter((k) => k !== 'text');

  if (keysA.length !== keysB.length) return false;

  return keysA.every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
};

const canonicalizeNode = (node: unknown): unknown => {
  if (!ElementApi.isElement(node)) return node;

  const rawChildren = node.children.map(canonicalizeNode);
  const merged: unknown[] = [];

  for (const child of rawChildren) {
    if (TextApi.isText(child)) {
      const prev = merged.at(-1);

      if (prev && TextApi.isText(prev)) {
        if (child.text === '') continue;
        if (prev.text === '') {
          merged[merged.length - 1] = child;
          continue;
        }
        if (sameTextMarks(prev, child)) {
          merged[merged.length - 1] = {
            ...prev,
            text: prev.text + child.text,
          };
          continue;
        }
      }
    }
    merged.push(child);
  }

  return { ...node, children: merged };
};

const canonicalValueChanged = (
  before: EditorDocumentValue,
  after: EditorDocumentValue
): boolean =>
  JSON.stringify(before.children.map(canonicalizeNode)) !==
  JSON.stringify(after.children.map(canonicalizeNode));

const isStalePick = (view: Editor, prepared: PreparedInkDigitize): boolean => {
  const { read } = view.plugin(BaseInkPlugin);
  const blockIds = new Set<string>();

  for (const meta of prepared.passages) {
    if (read.place(meta.copy)?.kind !== 'live') return true;
    blockIds.add(meta.blockId);
  }

  const currentOrder = blockIdsBetween(view, blockIds);

  if (
    currentOrder.length !== prepared.blockOrder.length ||
    currentOrder.some((id, index) => id !== prepared.blockOrder[index])
  ) {
    return true;
  }

  const currentShown = shownMarkIdsByBlock(view, blockIds);

  for (const [blockId, expected] of prepared.shownByBlock) {
    const actual = currentShown.get(blockId) ?? [];

    if (
      actual.length !== expected.length ||
      actual.some((id, index) => id !== expected[index])
    ) {
      return true;
    }
  }

  return false;
};

export const confirmInkDigitize = (
  view: Editor,
  prepared: PreparedInkDigitize,
  validated: Extract<ValidatedDigitizeReading, { ok: true }>,
  choices: readonly ConfirmChoice[],
  latestRequestId: string | undefined = latestInkDigitizeRequestId(view)
): ConfirmInkDigitizeResult => {
  if (!canDigitizeInk(view)) {
    return { reason: 'read-only-or-preview', status: 'blocked' };
  }
  if (
    validated.request !== prepared.request.request ||
    (latestRequestId !== undefined && validated.request !== latestRequestId)
  ) {
    return { reason: 'stale-request', status: 'blocked' };
  }
  if (isStalePick(view, prepared)) {
    return { status: 'stale' };
  }

  const { read } = view.plugin(BaseInkPlugin);
  const metaIndexById = new Map(
    prepared.passages.map((meta, index) => [meta.id, { index, meta }])
  );
  const pendingRanges: Range[] = view.plugin(AuthoredPlugin).installed
    ? view
        .plugin(AuthoredPlugin)
        .read.changes()
        .items.flatMap((item) => item.ranges)
    : [];

  type PlannedCorrection = {
    correctionIndex: number;
    edits: ResolvedEdit[];
    markIds: readonly string[];
    sortKey: readonly [
      passageIndex: number,
      charEnd: number,
      charStart: number,
    ];
  };

  const planned: PlannedCorrection[] = [];

  for (const choice of choices) {
    const correction = validated.corrections[choice.correctionIndex];
    const meaning = correction?.meanings[choice.meaningIndex];

    if (!correction || !meaning) continue;

    const resolvedEdits: ResolvedEdit[] = [];

    for (const edit of meaning.edits) {
      const entry = metaIndexById.get(edit.passage);

      if (!entry) return { status: 'stale' };

      const savedCopy = read.copy(entry.meta.copy);

      if (!savedCopy) return { status: 'stale' };

      const span = resolveEditSpan(savedCopy.text, entry.meta, edit);
      const range = read.range({
        copy: entry.meta.copy,
        end: span.charEnd,
        start: span.charStart,
      });

      if (!range) return { status: 'stale' };

      resolvedEdits.push({
        charEnd: span.charEnd,
        charStart: span.charStart,
        copy: entry.meta.copy,
        edit,
        insertText: span.insertText,
        passageIndex: entry.index,
        range,
      });
    }

    resolvedEdits.sort(
      (a, b) =>
        b.passageIndex - a.passageIndex ||
        b.charEnd - a.charEnd ||
        b.charStart - a.charStart
    );

    const head = resolvedEdits[0];

    planned.push({
      correctionIndex: choice.correctionIndex,
      edits: resolvedEdits,
      markIds: correction.markIds,
      sortKey: [head.passageIndex, head.charEnd, head.charStart],
    });
  }

  planned.sort(
    (a, b) =>
      b.sortKey[0] - a.sortKey[0] ||
      b.sortKey[1] - a.sortKey[1] ||
      b.sortKey[2] - a.sortKey[2]
  );

  const applied: Array<{
    correctionIndex: number;
    markIds: readonly string[];
  }> = [];
  const skipped: Array<{
    correctionIndex: number;
    markIds: readonly string[];
    reason: ConfirmSkipReason;
  }> = [];
  let committedCount = 0;

  for (const item of planned) {
    if (
      item.edits.some((resolved) =>
        rangesOverlapPending(resolved.range, pendingRanges)
      )
    ) {
      skipped.push({
        correctionIndex: item.correctionIndex,
        markIds: item.markIds,
        reason: 'pending-suggestion',
      });
      continue;
    }

    const isNoOpInput = item.edits.some((resolved) => {
      if (resolved.edit.kind === 'insert') {
        return (resolved.insertText ?? '').length === 0;
      }
      if (resolved.edit.kind === 'replace') {
        const copy = read.copy(resolved.copy);

        return (
          copy?.text.slice(resolved.charStart, resolved.charEnd) ===
          resolved.edit.text
        );
      }

      return false;
    });

    if (isNoOpInput) {
      skipped.push({
        correctionIndex: item.correctionIndex,
        markIds: item.markIds,
        reason: 'no-op',
      });
      continue;
    }

    let noOp = false;
    let threw = false;

    try {
      view.update((tx) => {
        if (committedCount === 0) tx.history.newBatch();
        else tx.history.merge();

        const before = tx.value();

        for (const resolved of item.edits) {
          const { edit, range } = resolved;

          if (edit.kind === 'delete') {
            tx.text.delete({ at: range });
          } else if (edit.kind === 'insert') {
            tx.text.insert(resolved.insertText ?? '', { at: range.anchor });
          } else if (edit.kind === 'replace') {
            tx.text.delete({ at: range });
            tx.text.insert(edit.text, { at: range.anchor });
          } else {
            tx.nodes.set(
              { highlight: true },
              { at: range, marks: true, split: true }
            );
          }
        }

        if (!canonicalValueChanged(before, tx.value())) {
          throw new NoOpRollbackError();
        }
        tx.plugin(BaseInkPlugin).setDigitized(item.markIds, true);
      });
    } catch (error) {
      if (error instanceof NoOpRollbackError) noOp = true;
      else threw = true;
    }

    if (noOp) {
      skipped.push({
        correctionIndex: item.correctionIndex,
        markIds: item.markIds,
        reason: 'no-op',
      });
      continue;
    }
    if (threw) {
      skipped.push({
        correctionIndex: item.correctionIndex,
        markIds: item.markIds,
        reason: 'refused',
      });
      continue;
    }

    const shownAfter = new Set(read.shownMarks().map((mark) => mark.id));
    const digitized = item.markIds.every((id) => !shownAfter.has(id));

    if (!digitized) {
      skipped.push({
        correctionIndex: item.correctionIndex,
        markIds: item.markIds,
        reason: 'refused',
      });
    } else {
      committedCount += 1;
      applied.push({
        correctionIndex: item.correctionIndex,
        markIds: item.markIds,
      });
    }
  }

  view.plugin(InkPlugin).api.setPicked([]);

  return {
    applied,
    skipped,
    status: 'applied',
  };
};

const isCommentEdit = (
  edit: InkDigitizeEdit
): edit is Extract<InkDigitizeEdit, { kind: 'answer' | 'comment' }> =>
  edit.kind === 'comment' || edit.kind === 'answer';

export const confirmInkDigitizeWithComments = async (
  view: Editor,
  prepared: PreparedInkDigitize,
  validated: Extract<ValidatedDigitizeReading, { ok: true }>,
  choices: readonly ConfirmChoice[],
  latestRequestId: string | undefined = latestInkDigitizeRequestId(view)
): Promise<ConfirmInkDigitizeResult> => {
  if (!canDigitizeInk(view)) {
    return { reason: 'read-only-or-preview', status: 'blocked' };
  }
  if (
    validated.request !== prepared.request.request ||
    (latestRequestId !== undefined && validated.request !== latestRequestId)
  ) {
    return { reason: 'stale-request', status: 'blocked' };
  }
  if (isStalePick(view, prepared)) {
    return { status: 'stale' };
  }

  const textChoices: ConfirmChoice[] = [];
  const commentChoices: ConfirmChoice[] = [];

  for (const choice of choices) {
    const correction = validated.corrections[choice.correctionIndex];
    const meaning = correction?.meanings[choice.meaningIndex];

    if (!correction || !meaning) continue;
    if (meaning.edits.some(isCommentEdit)) {
      commentChoices.push(choice);
    } else {
      textChoices.push(choice);
    }
  }

  if (commentChoices.length === 0) {
    return confirmInkDigitize(
      view,
      prepared,
      validated,
      textChoices,
      latestRequestId
    );
  }

  const { read } = view.plugin(BaseInkPlugin);
  const metaById = new Map(prepared.passages.map((meta) => [meta.id, meta]));

  type PinnedCommentEdit = Readonly<{
    anchor: Anchor<Range>;
    edit: Extract<InkDigitizeEdit, { kind: 'answer' | 'comment' }>;
    excerpt: string;
  }>;
  type PlannedCommentCorrection = Readonly<{
    correctionIndex: number;
    edits: readonly PinnedCommentEdit[];
    markIds: readonly string[];
  }>;

  const pinnedCorrections: PlannedCommentCorrection[] = [];
  const allAnchors: Array<Anchor<Range>> = [];

  const releaseAllAnchors = () => {
    for (const anchor of allAnchors) anchor.release();
    allAnchors.length = 0;
  };

  try {
    for (const choice of commentChoices) {
      const correction = validated.corrections[choice.correctionIndex];
      const meaning = correction.meanings[choice.meaningIndex];
      const pinnedEdits: PinnedCommentEdit[] = [];

      for (const edit of meaning.edits) {
        if (!isCommentEdit(edit)) continue;
        const meta = metaById.get(edit.passage);

        if (!meta) {
          releaseAllAnchors();

          return { status: 'stale' };
        }
        const savedCopy = read.copy(meta.copy);

        if (!savedCopy) {
          releaseAllAnchors();

          return { status: 'stale' };
        }
        const span = resolveEditSpan(savedCopy.text, meta, edit);
        const range = read.range({
          copy: meta.copy,
          end: span.charEnd,
          start: span.charStart,
        });

        if (!range) {
          releaseAllAnchors();

          return { status: 'stale' };
        }
        const anchor = view.anchor(range, {
          association: 'inward',
          deletion: 'nearest',
        });

        allAnchors.push(anchor);
        pinnedEdits.push({
          anchor,
          edit,
          excerpt: savedCopy.text.slice(span.charStart, span.charEnd),
        });
      }

      if (pinnedEdits.length > 0) {
        pinnedCorrections.push({
          correctionIndex: choice.correctionIndex,
          edits: pinnedEdits,
          markIds: correction.markIds,
        });
      }
    }

    const applied: Array<{
      correctionIndex: number;
      markIds: readonly string[];
      threadIds?: readonly string[];
    }> = [];
    const skipped: Array<{
      correctionIndex: number;
      markIds: readonly string[];
      reason: ConfirmSkipReason;
    }> = [];

    if (textChoices.length > 0) {
      const textResult = confirmInkDigitize(
        view,
        prepared,
        validated,
        textChoices,
        latestRequestId
      );

      if (textResult.status !== 'applied') {
        return textResult;
      }
      applied.push(...textResult.applied);
      skipped.push(...textResult.skipped);
    }

    const commentsPlugin = view.plugin(BaseCommentsPlugin);

    if (!commentsPlugin.installed) {
      for (const item of pinnedCorrections) {
        skipped.push({
          correctionIndex: item.correctionIndex,
          markIds: item.markIds,
          reason: 'no-comments-plugin',
        });
      }

      return { applied, skipped, status: 'applied' };
    }

    for (const item of pinnedCorrections) {
      const threadIds: string[] = [];
      let failureReason: ConfirmSkipReason | null = null;

      for (const [editIndex, pinned] of item.edits.entries()) {
        const range = pinned.anchor.resolve(view);

        if (!range || view.read.ranges.isEmpty(range)) {
          failureReason = 'refused';
          break;
        }
        const isLastEdit = editIndex === item.edits.length - 1;
        const body = [
          {
            children: [{ text: pinned.edit.text }],
            type: 'paragraph',
          },
        ];
        const data: CommentData =
          pinned.edit.kind === 'answer'
            ? { kind: 'answer', question: pinned.edit.question }
            : { kind: 'comment' };

        try {
          const created = await commentsPlugin.api.createThread({
            body,
            data,
            excerpt: pinned.excerpt,
            target: { range, type: 'range' },
            ...(isLastEdit
              ? {
                  withHistory: (tx) => {
                    const shownNow = new Set(
                      view
                        .plugin(BaseInkPlugin)
                        .read.shownMarks()
                        .map((mark) => mark.id)
                    );
                    const stillShown = item.markIds.filter((id) =>
                      shownNow.has(id)
                    );

                    if (stillShown.length > 0) {
                      tx.plugin(BaseInkPlugin).setDigitized(stillShown, true);
                    }
                  },
                }
              : {}),
          });

          if (created.status === 'applied') {
            threadIds.push(created.value);
          } else {
            failureReason =
              created.status === 'rejected' ? 'save-rejected' : 'refused';
            break;
          }
        } catch {
          failureReason = 'save-failed';
          break;
        }
      }

      if (failureReason) {
        skipped.push({
          correctionIndex: item.correctionIndex,
          markIds: item.markIds,
          reason: failureReason,
        });
      } else {
        applied.push({
          correctionIndex: item.correctionIndex,
          markIds: item.markIds,
          threadIds,
        });
      }
    }

    if (view.plugin(InkPlugin).installed) {
      if (skipped.length === 0) {
        view.plugin(InkPlugin).api.setPicked([]);
      } else {
        const digitizedSet = new Set(applied.flatMap((entry) => entry.markIds));
        const remaining = view
          .plugin(InkPlugin)
          .viewStore.get()
          .picked.filter((id) => !digitizedSet.has(id));

        view.plugin(InkPlugin).api.setPicked(remaining);
      }
    }

    return { applied, skipped, status: 'applied' };
  } finally {
    releaseAllAnchors();
  }
};
