import type { DocumentIndex } from '../../core/change/document-index';
import type { LetterOrigin } from '../../core/change/lineage';
import type { RootChange } from '../../core/change/root-change';
import {
  isElementNode,
  isTextNode,
  type JsonNode,
} from '../../core/change/tokens';
import type { Descendant, Path, Text } from '../../index';
import {
  NEW_LETTER,
  OTHER_LETTER,
  type RunStretch,
  VALUE_LETTER,
} from './text-runs';

/**
 * Letters `[from, to)` of a document. `origin` is the position of the old
 * letter its first letter keeps, or `NEW_LETTER`, `VALUE_LETTER` or
 * `OTHER_LETTER`.
 */
type Stretch = Readonly<{ from: number; origin: number; to: number }>;

/**
 * A commit's letter origins in one root, as one writer reads them: stretches
 * of `after`, the document it writes, sorted by position, whose kept letters
 * name positions in `before`, the document its Yjs texts show.
 */
export type YjsLetters = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  stretches: readonly Stretch[];
}>;

/**
 * A writer's letters, and where the old children it writes stand in
 * `letters.before`: under `path`, from child `offset`. Null where the writer
 * cannot place them, so it writes as base does.
 */
export type YjsLettersAt = Readonly<{
  letters: YjsLetters;
  place: Readonly<{ offset: number; path: Path }> | null;
}>;

export type LetterPlace = Readonly<{
  letterEnds: readonly number[];
  start: number;
}>;

/** A text leaf's close token and the next leaf's open token. */
const LEAF_GAP = 2;

const pieceEnd = ({ letterEnds, start }: LetterPlace, index: number) =>
  start + letterEnds[index] + LEAF_GAP * index;

const endOf = (place: LetterPlace) =>
  place.letterEnds.length === 0
    ? place.start
    : pieceEnd(place, place.letterEnds.length - 1);

export const yjsLettersOf = (
  origins: readonly LetterOrigin[],
  after: DocumentIndex,
  before: DocumentIndex
): YjsLetters => ({
  after,
  before,
  stretches: origins.map(({ from, to, ...origin }) => ({
    from,
    origin:
      origin.kind === 'kept'
        ? origin.at
        : origin.kind === 'new'
          ? NEW_LETTER
          : VALUE_LETTER,
    to,
  })),
});

const firstEndingAfter = (
  count: number,
  endAt: (index: number) => number,
  position: number,
  hint = 0
) => {
  for (let index = hint; index < Math.min(hint + 2, count); index += 1) {
    if (
      endAt(index) > position &&
      (index === 0 || endAt(index - 1) <= position)
    ) {
      return index;
    }
  }

  let low = 0;
  let high = count;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (endAt(middle) <= position) low = middle + 1;
    else high = middle;
  }

  return low;
};

const originFrom = (stretch: Stretch, from: number) =>
  stretch.origin < 0 ? stretch.origin : stretch.origin + from - stretch.from;

/**
 * `letters` as a writer of `document`, the before document of `change`, reads
 * them, where `change` turns it into `letters.after`. Letters `change` writes
 * are not in `document` and drop out; the kept letters still name positions
 * in `letters.before`.
 */
export const lettersBefore = (
  letters: YjsLetters,
  change: RootChange,
  document: DocumentIndex
): YjsLetters => {
  const { stretches } = letters;
  const { sections } = change;
  const mapped: Stretch[] = [];
  let at = 0;
  let fromA = 0;
  let fromB = 0;

  for (let index = 0; index < sections.length; index += 2) {
    const length = sections[index];
    const inserted = sections[index + 1];

    if (inserted < 0) {
      const toB = fromB + length;

      while (at < stretches.length && stretches[at].to <= fromB) at += 1;
      for (
        let next = at;
        next < stretches.length && stretches[next].from < toB;
        next += 1
      ) {
        const stretch = stretches[next];
        const start = Math.max(stretch.from, fromB);
        const end = Math.min(stretch.to, toB);

        if (start < end) {
          mapped.push({
            from: start - fromB + fromA,
            origin: originFrom(stretch, start),
            to: end - fromB + fromA,
          });
        }
      }
      fromB = toB;
    } else {
      fromB += inserted;
    }
    fromA += length;
  }

  return { after: document, before: letters.before, stretches: mapped };
};

/**
 * `letters` as a writer whose Yjs texts show `document` reads them, where
 * `change` turns `letters.before` into `document`. A kept letter whose old
 * letter `change` replaced keeps none of `document`'s.
 */
export const lettersAfter = (
  letters: YjsLetters,
  change: RootChange,
  document: DocumentIndex
): YjsLetters => {
  const { sections } = change;
  const startsA: number[] = [];
  const startsB: number[] = [];
  let fromA = 0;
  let fromB = 0;

  for (let index = 0; index < sections.length; index += 2) {
    const inserted = sections[index + 1];

    startsA.push(fromA);
    startsB.push(fromB);
    fromA += sections[index];
    fromB += inserted < 0 ? sections[index] : inserted;
  }

  const mapped: Stretch[] = [];

  for (const stretch of letters.stretches) {
    if (stretch.origin < 0) {
      mapped.push(stretch);
      continue;
    }

    let low = 0;
    let high = startsA.length;

    while (low < high) {
      const middle = (low + high) >> 1;

      if (startsA[middle] <= stretch.origin) low = middle + 1;
      else high = middle;
    }

    let section = low - 1;
    let { from } = stretch;
    let old = stretch.origin;

    while (from < stretch.to) {
      if (section < 0 || section >= startsA.length) {
        mapped.push({ from, origin: OTHER_LETTER, to: stretch.to });
        break;
      }

      const length = sections[section * 2];
      const take = Math.min(stretch.to - from, startsA[section] + length - old);

      if (take > 0) {
        mapped.push({
          from,
          origin:
            sections[section * 2 + 1] < 0
              ? startsB[section] + old - startsA[section]
              : OTHER_LETTER,
          to: from + take,
        });
        from += take;
        old += take;
      }
      section += 1;
    }
  }

  return { after: letters.after, before: document, stretches: mapped };
};

export const holdsNewLetters = (
  { after, stretches }: YjsLetters,
  path: Path,
  from: number,
  to: number
) => {
  const end = after.childPosition(path, to);

  for (
    let at = firstEndingAfter(
      stretches.length,
      (index) => stretches[index].to,
      after.childPosition(path, from)
    );
    at < stretches.length && stretches[at].from < end;
    at += 1
  ) {
    if (stretches[at].origin === NEW_LETTER) return true;
  }

  return false;
};

const childrenAt = (document: DocumentIndex, path: Path) => {
  let children: Readonly<{ at: (index: number) => JsonNode | undefined }> =
    document.nodes;

  for (const index of path) {
    const node = children.at(index);

    if (!(node && isElementNode(node))) return null;
    ({ children } = node);
  }

  return children;
};

/**
 * Where each text of `children`, the children under `path`, starts in
 * `document`, or null when `document` does not hold their texts there.
 */
export const textStartsOf = (
  document: DocumentIndex,
  path: Path,
  children: readonly Descendant[]
): ReadonlyArray<number | undefined> | null => {
  const held = childrenAt(document, path);

  if (!held) return null;

  let end = 0;

  for (const [index, child] of children.entries()) {
    if (!('text' in child)) continue;

    const node = held.at(index);

    if (!(node && isTextNode(node)) || node.text !== child.text) return null;
    end = index + 1;
  }

  const starts = document.contentStarts(path, end);

  return children.map((child, index) =>
    'text' in child ? starts[index] : undefined
  );
};

/**
 * The place of `leaves` as the children from `from` under `path`, or null
 * when `document` does not hold them there.
 */
export const placeOfLeaves = (
  document: DocumentIndex,
  path: Path,
  from: number,
  leaves: readonly Text[]
): LetterPlace | null => {
  const held = childrenAt(document, path);

  if (!held) return null;

  const letterEnds: number[] = [];
  let total = 0;

  for (let offset = 0; offset < leaves.length; offset += 1) {
    const { text } = leaves[offset];
    const node = held.at(from + offset);

    if (!(node && isTextNode(node)) || node.text !== text) return null;
    total += text.length;
    letterEnds.push(total);
  }

  return {
    letterEnds,
    start:
      leaves.length === 0
        ? 0
        : document.positionAt({ offset: 0, path: [...path, from] }),
  };
};

export const slicePlace = (
  place: LetterPlace,
  from: number,
  length: number
): LetterPlace => {
  const letterEnds: number[] = [];
  let first = place.start;
  let offset = 0;
  let total = 0;

  for (let index = 0; index < place.letterEnds.length; index += 1) {
    const size = place.letterEnds[index] - offset;
    const cutFrom = Math.max(from - offset, 0);
    const cutTo = Math.min(from + length - offset, size);

    if (letterEnds.length === 0 ? cutFrom < cutTo : offset < from + length) {
      if (letterEnds.length === 0) {
        first = pieceEnd(place, index) - size + cutFrom;
      }
      total += cutTo - cutFrom;
      letterEnds.push(total);
    }
    offset = place.letterEnds[index];
  }

  return { letterEnds, start: first };
};

const lettersBeforeIn = (place: LetterPlace) => {
  const { letterEnds, start } = place;
  const total = letterEnds.at(-1) ?? 0;
  const endAt = (index: number) => pieceEnd(place, index);
  let piece = 0;

  return (at: number) => {
    piece = firstEndingAfter(letterEnds.length, endAt, at, piece);
    if (piece === letterEnds.length) return total;

    const before = piece === 0 ? 0 : letterEnds[piece - 1];

    return before + Math.max(at - (start + before + LEAF_GAP * piece), 0);
  };
};

/**
 * Where each letter of a run comes from, given where its new letters stand in
 * `letters.after` and its old letters in `letters.before`, as stretches that
 * cover the run's new text in order.
 */
export const runLettersOf = (
  { stretches }: YjsLetters,
  after: LetterPlace,
  before: LetterPlace
): RunStretch[] => {
  const run: Array<{ from: number; origin: number; to: number }> = [];

  if (after.letterEnds.length === 0) return run;

  const newAt = lettersBeforeIn(after);
  const oldAt = lettersBeforeIn(before);
  const add = (from: number, to: number, origin: number) => {
    if (to <= from) return;

    const start = newAt(from);
    const end = newAt(to);
    const last = run.at(-1);

    if (start === end) return;
    if (
      last?.to === start &&
      (origin < 0
        ? last.origin === origin
        : last.origin >= 0 && last.origin + last.to - last.from === origin)
    ) {
      last.to = end;
    } else run.push({ from: start, origin, to: end });
  };
  const first = after.start;
  const stop = endOf(after);
  const oldFirst = before.start;
  const oldStop = endOf(before);
  let letter = first;

  for (
    let at = firstEndingAfter(
      stretches.length,
      (index) => stretches[index].to,
      first
    );
    at < stretches.length && stretches[at].from < stop;
    at += 1
  ) {
    const stretch = stretches[at];
    const end = Math.min(stretch.to, stop);

    add(letter, stretch.from, VALUE_LETTER);
    letter = Math.max(letter, stretch.from);
    if (stretch.origin < 0) {
      add(letter, end, stretch.origin);
    } else {
      const old = originFrom(stretch, letter);
      const keptFrom = Math.min(letter + Math.max(oldFirst - old, 0), end);
      const keptTo = Math.max(
        end - Math.max(old + end - letter - oldStop, 0),
        keptFrom
      );

      add(letter, keptFrom, OTHER_LETTER);
      add(keptFrom, keptTo, oldAt(old + keptFrom - letter));
      add(keptTo, end, OTHER_LETTER);
    }
    letter = end;
  }
  add(letter, stop, VALUE_LETTER);

  return run;
};

/**
 * The letters of a run whose new leaves are the children from `from` under
 * `path` in `letters.after`, and whose old leaves are the children from
 * `beforeFrom` at the writer's place. Undefined where the writer has no
 * place, so the run is written as base writes it.
 */
export const runLettersAt = (
  at: YjsLettersAt | undefined,
  path: Path,
  from: number,
  leaves: readonly Text[],
  beforeFrom: number,
  beforeLeaves: readonly Text[]
): RunStretch[] | undefined => {
  if (!at?.place) return undefined;

  const { letters, place } = at;
  const after = placeOfLeaves(letters.after, path, from, leaves);
  const before = placeOfLeaves(
    letters.before,
    place.path,
    place.offset + beforeFrom,
    beforeLeaves
  );

  return after && before ? runLettersOf(letters, after, before) : undefined;
};
