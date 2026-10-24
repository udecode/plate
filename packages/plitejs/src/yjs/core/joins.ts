import { type Diff, DiffOp } from 'diff-match-patch-ts';

import { DocumentIndex } from '../../core/change/document-index';
import { joinsOf } from '../../core/change/join';
import {
  addSection,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import {
  isElementNode,
  isTextNode,
  type JsonNode,
  type JsonToken,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import { textPropertiesEqual } from '../../core/value-codec';
import { getDefined } from '../../internal/get-defined';

type Range = Readonly<{ from: number; to: number }>;
type Path = readonly number[];

/**
 * Sibling lines that one change's joins make one line: the first line, each
 * line joined into it in order, and the lines removed whole between them.
 */
export type JoinRun = Readonly<{
  lines: readonly Path[];
  range: Range;
  removed: readonly Path[];
}>;

const pathAt = (document: DocumentIndex, position: number): Path =>
  getDefined(document.nodeStartingAt(position)).path;

/** The change's joins, a chain of joins through shared lines as one run. */
export const joinRunsOf = (
  change: RootChange,
  document: DocumentIndex
): JoinRun[] => {
  const runs: Array<{ lines: Path[]; range: Range; removed: Path[] }> = [];

  for (const join of joinsOf(change, document)) {
    const first = pathAt(document, join.first.from);
    const second = pathAt(document, join.second.from);
    const parent = first.slice(0, -1);
    const removed: Path[] = [];

    for (
      let at = getDefined(first.at(-1)) + 1;
      at < getDefined(second.at(-1));
      at++
    ) {
      removed.push([...parent, at]);
    }

    const last = runs.at(-1);

    if (last && last.range.to === join.first.to) {
      last.lines.push(second);
      last.removed.push(...removed);
      last.range = { from: last.range.from, to: join.second.to };
    } else {
      runs.push({
        lines: [first, second],
        range: { from: join.first.from, to: join.second.to },
        removed,
      });
    }
  }

  return runs;
};

/**
 * Split a change into what it does inside the runs' lines and what it does
 * elsewhere, so `inner.compose(outer)` is the change. Returns null when an
 * edit crosses a run's edge.
 */
export const splitAtRuns = (change: RootChange, runs: readonly JoinRun[]) => {
  const inner: number[] = [];
  const innerData: SectionData[] = [];
  const outer: number[] = [];
  const outerData: SectionData[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const value = change.data[index / 2] ?? null;
    const end = position + length;

    if (inserted === -1) {
      addSection(inner, innerData, length, -1, null);
      addSection(outer, outerData, length, -1, null);
      position = end;
      continue;
    }

    const touched = runs.find(({ range }) =>
      length === 0
        ? range.from < position && position < range.to
        : range.from < end && position < range.to
    );

    if (touched && (position < touched.range.from || touched.range.to < end)) {
      return null;
    }
    if (touched) {
      addSection(inner, innerData, length, inserted, value);
      addSection(
        outer,
        outerData,
        inserted === -2 ? length : inserted,
        -1,
        null
      );
    } else {
      addSection(inner, innerData, length, -1, null);
      addSection(outer, outerData, length, inserted, value);
    }
    position = end;
  }

  return {
    inner: RootChange.fromSections(inner, innerData),
    outer: RootChange.fromSections(outer, outerData),
  };
};

const lettersOf = (tokens: readonly JsonToken[]) =>
  tokens.map((token) => (token.kind === 'text' ? token.text : '')).join('');

export const pushDiff = (diff: Diff[], operation: DiffOp, text: string) => {
  if (text.length === 0) return;

  const last = diff.at(-1);

  if (last?.[0] === operation) last[1] += text;
  else diff.push([operation, text]);
};

/**
 * The letters a change keeps, deletes and inserts in `[from, to)` of
 * `document`, in order. Returns null when it inserts an element there.
 */
export const letterEditsIn = (
  change: RootChange,
  document: DocumentIndex,
  from: number,
  to: number
): Diff[] | null => {
  const diff: Diff[] = [];
  let position = 0;

  for (
    let index = 0;
    index < change.sections.length && position <= to;
    index += 2
  ) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const start = Math.max(position, from);
    const end = Math.min(position + length, to);

    if (start < end) {
      pushDiff(
        diff,
        inserted < 0 ? DiffOp.Equal : DiffOp.Delete,
        lettersOf(document.slice(start, end).tokens)
      );
    }
    if (inserted > 0 && from < position && position < to) {
      const { tokens } = change.data[index / 2] as PreparedTokenSlice;

      if (
        tokens.some(
          (token) => token.kind !== 'text' && token.nodeKind !== 'text'
        )
      ) {
        return null;
      }
      pushDiff(diff, DiffOp.Insert, lettersOf(tokens));
    }
    position += length;
  }

  return diff;
};

/**
 * The letters a change inserts at positions `from` to `to` of the document,
 * both included, such as at the edges of an element it removes whole, where
 * `letterEditsIn` credits them to no text. Returns null when it inserts an
 * element there.
 */
export const lettersInsertedAt = (
  change: RootChange,
  from: number,
  to: number
): string | null => {
  let letters = '';
  let position = 0;

  for (
    let index = 0;
    index < change.sections.length && position <= to;
    index += 2
  ) {
    if (change.sections[index + 1] > 0 && from <= position) {
      const { tokens } = change.data[index / 2] as PreparedTokenSlice;

      if (
        tokens.some(
          (token) => token.kind !== 'text' && token.nodeKind !== 'text'
        )
      ) {
        return null;
      }
      letters += lettersOf(tokens);
    }
    position += change.sections[index];
  }

  return letters;
};

/** Whether a change leaves `[from, to)` alone, removes it whole, or edits it. */
export const editOf = (change: RootChange, from: number, to: number) => {
  let position = 0;
  let edit: 'kept' | 'removed' = 'kept';

  for (
    let index = 0;
    index < change.sections.length && position < to;
    index += 2
  ) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const end = position + length;

    if (inserted !== -1 && position < to && from < end) {
      if (inserted < 0 || position > from || end < to) return 'edited';
      edit = 'removed';
    } else if (
      inserted > 0 &&
      length === 0 &&
      from < position &&
      position < to
    ) {
      return 'edited';
    }
    position = end;
  }

  return edit;
};

/**
 * For each range, sorted and disjoint, whether one replacement in `change`
 * covers it whole: a node the change removes, or with `output`, a range of
 * the output, a node it inserts.
 */
export const replacedWhole = (
  change: RootChange,
  ranges: ReadonlyArray<Readonly<{ from: number; to: number }>>,
  output: boolean
): boolean[] => {
  const { sections } = change;
  const spanOf = (index: number) => {
    const inserted = sections[index + 1];

    return output && inserted >= 0 ? inserted : sections[index];
  };
  let index = 0;
  let start = 0;

  return ranges.map(({ from, to }) => {
    while (index < sections.length && start + spanOf(index) <= from) {
      start += spanOf(index);
      index += 2;
    }

    return (
      index < sections.length &&
      sections[index + 1] >= 0 &&
      start <= from &&
      to <= start + spanOf(index)
    );
  });
};

/**
 * A join an import found: the joined lines, first first, as paths in the
 * document before the batch, and each line's letter edits, one list per text
 * of the line in order. `after` is the index, among the after nodes, of the
 * top-level node that holds the joined line.
 */
export type FoundJoin = Readonly<{
  after: number | null;
  edits: ReadonlyArray<ReadonlyArray<readonly Diff[]>>;
  lines: readonly Path[];
  removedElements: ReadonlyArray<readonly number[]>;
}>;

type Edit = Readonly<{ from: number; insert?: PreparedTokenSlice; to: number }>;
type Leaf = Readonly<{ path: Path; text: string }>;

/** A line's texts, each as its run of adjacent text leaves. */
const textsOf = (document: DocumentIndex, path: Path) => {
  const line = document.node(path);
  const texts: Leaf[][] = [];

  if (!isElementNode(line)) return texts;

  let previous = false;

  line.children.forEach((child, index) => {
    if (!isTextNode(child)) {
      previous = false;
      return;
    }
    if (!previous) texts.push([]);
    getDefined(texts.at(-1)).push({ path: [...path, index], text: child.text });
    previous = true;
  });

  return texts;
};

/**
 * The edits of one text's letters, with each leaf's letters after them.
 * Text inserted where two leaves meet goes into the first.
 */
const textEdits = (
  document: DocumentIndex,
  leaves: readonly Leaf[],
  diff: readonly Diff[]
) => {
  const edits: Edit[] = [];
  const kept = leaves.map(({ text }) => text.length);
  const typed = leaves.map(() => 0);
  let offset = 0;
  let leaf = 0;
  let start = 0;
  const locate = (at: number, typing: boolean) => {
    while (
      leaf < leaves.length - 1 &&
      (typing
        ? at > start + leaves[leaf].text.length
        : at >= start + leaves[leaf].text.length)
    ) {
      start += leaves[leaf].text.length;
      leaf += 1;
    }

    return document.positionAt({ offset: at - start, path: leaves[leaf].path });
  };

  for (const [operation, value] of diff) {
    if (operation === DiffOp.Equal) {
      offset += value.length;
    } else if (operation === DiffOp.Insert) {
      const at = locate(offset, true);

      typed[leaf] += value.length;
      edits.push({ from: at, insert: PreparedTokenSlice.text(value), to: at });
    } else {
      let rest = value.length;

      while (rest > 0) {
        const from = locate(offset, false);
        const count = Math.min(rest, start + leaves[leaf].text.length - offset);

        if (count <= 0) return null;
        kept[leaf] -= count;
        edits.push({ from, to: from + count });
        offset += count;
        rest -= count;
      }
    }
  }

  if (offset !== leaves.reduce((sum, { text }) => sum + text.length, 0)) {
    return null;
  }

  return { edits, letters: kept.map((count, index) => count + typed[index]) };
};

const letterCount = (node: JsonNode): number =>
  isTextNode(node)
    ? node.text.length
    : (node.children ?? []).reduce((sum, child) => sum + letterCount(child), 0);

const joinsTextsAt = (line: JsonNode, offset: number) => {
  let start = 0;

  for (const child of line.children ?? []) {
    const end = start + letterCount(child);

    if (isTextNode(child) && start < offset && offset < end) return true;
    start = end;
  }

  return false;
};

const joinedLineIn = (
  after: readonly JsonNode[],
  join: FoundJoin,
  shift: number
): JsonNode | null => {
  const [, ...inner] = join.lines[0];
  let node = join.after === null ? undefined : after[join.after];

  for (const [depth, index] of inner.entries()) {
    node = node?.children?.[depth === inner.length - 1 ? index - shift : index];
  }

  return node && isElementNode(node) ? node : null;
};

const elementWithChildrenAt = (document: DocumentIndex, path: Path) => {
  let node: JsonNode | undefined = document.child(path[0]);

  for (const index of path.slice(1)) {
    node = node && isElementNode(node) ? node.children[index] : undefined;
  }

  return node && isElementNode(node) && node.children.length > 0 ? node : null;
};

const textAt = (document: DocumentIndex, path: Path) => {
  const node = document.node(path);

  return isTextNode(node) ? node : null;
};

/**
 * Build the change of a stretch of top-level lines that holds joins: each
 * joined line's letter edits, then each join, then a diff of the rest, line
 * by line around each top-level joined line. Returns null when the joins do
 * not fit `before`.
 */
export const joinedChange = (
  before: DocumentIndex,
  after: readonly JsonNode[],
  joins: readonly FoundJoin[],
  between: (before: DocumentIndex, after: DocumentIndex) => RootChange
): RootChange | null => {
  const edits: Edit[] = [];
  const anchors = new Map<number, number>();
  const shifts = new Map<string, number>();

  if (
    !joins.every(({ lines }) =>
      lines.every((line) => elementWithChildrenAt(before, line))
    )
  ) {
    return null;
  }

  for (const join of joins) {
    const parentKey = join.lines[0].slice(0, -1).join(',');
    const shift = shifts.get(parentKey) ?? 0;
    const joinedLine = joinedLineIn(after, join, shift);
    const letters = new Map<string, number>();
    const lineLetters: number[] = [];
    const removedTexts: Range[] = [];
    const lineEdits: Edit[] = [];

    for (const [index, line] of join.lines.entries()) {
      const texts = textsOf(before, line);
      const diffs = join.edits[index];

      if (texts.length !== diffs.length) return null;
      for (const [order, leaves] of texts.entries()) {
        const text = textEdits(before, leaves, diffs[order]);

        if (!text) return null;
        lineEdits.push(...text.edits);
        leaves.forEach((leaf, at) => {
          letters.set(leaf.path.join(','), text.letters[at]);
        });
      }

      const node = before.node(line);
      const removed = join.removedElements[index];

      for (const at of removed) {
        const child = node.children?.[at];

        if (!child || isTextNode(child)) return null;
        lineEdits.push(before.nodeRange([...line, at]));
      }
      lineLetters.push(
        (node.children ?? []).reduce(
          (sum, child, at) =>
            sum +
            (isTextNode(child)
              ? getDefined(letters.get([...line, at].join(',')))
              : removed.includes(at)
                ? 0
                : letterCount(child)),
          0
        )
      );
    }
    shifts.set(
      parentKey,
      shift +
        getDefined(join.lines.at(-1)?.at(-1)) -
        getDefined(join.lines[0].at(-1))
    );

    for (let index = 0; index + 1 < join.lines.length; index++) {
      const first = join.lines[index];
      const second = join.lines[index + 1];
      const firstRange = before.nodeRange(first);
      const secondRange = before.nodeRange(second);
      const firstNode = getDefined(elementWithChildrenAt(before, first));
      const lastPath = [...first, firstNode.children.length - 1];
      const headPath = [...second, 0];
      const last = textAt(before, lastPath);
      const head = textAt(before, headPath);
      const junction = lineLetters
        .slice(0, index + 1)
        .reduce((sum, count) => sum + count, 0);

      const merges = Boolean(
        last &&
        head &&
        (joinedLine
          ? joinsTextsAt(joinedLine, junction)
          : textPropertiesEqual(last, head))
      );
      const emptied = (path: Path) => letters.get(path.join(',')) === 0;

      if (!merges && last && head && emptied(lastPath)) {
        const range = before.nodeRange(lastPath);

        removedTexts.push(range);
        edits.push({ from: range.from, to: secondRange.from + 1 });
      } else if (merges || (last && head && emptied(headPath))) {
        edits.push({ from: firstRange.to - 2, to: secondRange.from + 2 });
      } else {
        edits.push({ from: firstRange.to - 1, to: secondRange.from + 1 });
      }
    }

    edits.push(
      ...lineEdits.filter(
        ({ from, to }) =>
          !removedTexts.some((range) => range.from <= from && to <= range.to)
      )
    );
    if (join.after !== null) anchors.set(join.lines[0][0], join.after);
  }

  const ordered = edits
    .map((edit, index) => ({ ...edit, index }))
    .sort(
      (left, right) =>
        left.from - right.from ||
        Number(left.to > left.from) - Number(right.to > right.from) ||
        left.index - right.index
    );

  if (
    ordered.some(
      (edit, index) => index > 0 && edit.from < ordered[index - 1].to
    )
  ) {
    return null;
  }

  const joined = RootChange.create(before, ordered);
  const middle = joined.apply(before);
  const rest = piecewiseBetween(
    middle,
    after,
    [...anchors]
      .map(([line, at]) => ({
        after: at,
        line: getDefined(
          middle.nodeStartingAt(
            getDefined(joined.mapPos(before.childPosition([], line), 1))
          )
        ).path[0],
      }))
      .sort((left, right) => left.line - right.line),
    between
  );

  const change = rest && joined.compose(rest);

  return change && readsAsExactly(change, before, joins) ? change : null;
};

const pairKey = (first: Path, second: Path) => `${first}>${second}`;

const readsAsExactly = (
  change: RootChange,
  before: DocumentIndex,
  joins: readonly FoundJoin[]
) => {
  const read = new Set(
    joinsOf(change, before).map((join) =>
      pairKey(pathAt(before, join.first.from), pathAt(before, join.second.from))
    )
  );
  const found = joins.flatMap(({ lines }) =>
    lines.slice(1).map((line, index) => pairKey(lines[index], line))
  );

  return read.size === found.length && found.every((key) => read.has(key));
};

/**
 * Diff `after` against `document` piece by piece: the lines between two
 * anchors, then each anchor line on its own.
 */
const piecewiseBetween = (
  document: DocumentIndex,
  after: readonly JsonNode[],
  anchors: ReadonlyArray<Readonly<{ after: number; line: number }>>,
  between: (before: DocumentIndex, after: DocumentIndex) => RootChange
) => {
  const nodes = document.value;
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;
  let line = 0;
  let at = 0;
  const diff = (lineTo: number, afterTo: number) => {
    if (lineTo < line || afterTo < at) return false;

    const from = document.childPosition([], line);
    const local = between(
      DocumentIndex.fromValue(nodes.slice(line, lineTo)),
      DocumentIndex.fromValue(after.slice(at, afterTo))
    );

    if (!local.empty) {
      addSection(sections, data, from - position, -1, null);
      for (let index = 0; index < local.sections.length; index += 2) {
        addSection(
          sections,
          data,
          local.sections[index],
          local.sections[index + 1],
          local.data[index / 2] ?? null
        );
      }
      position = from + local.length;
    }
    line = lineTo;
    at = afterTo;

    return true;
  };

  for (const anchor of anchors) {
    if (!diff(anchor.line, anchor.after)) return null;
    if (!diff(anchor.line + 1, anchor.after + 1)) return null;
  }
  if (!diff(nodes.length, after.length)) return null;
  addSection(sections, data, document.length - position, -1, null);

  return RootChange.fromSections(sections, data);
};

type TextDelta = ReadonlyArray<
  Readonly<{
    delete?: number;
    insert?: unknown;
    retain?: number;
  }>
>;

/**
 * The letter edits a text's deltas make, in order, to `letters`. Returns
 * null for a delta that inserts anything but text.
 */
export const composeTextDeltas = (
  letters: string,
  deltas: readonly TextDelta[]
): Diff[] | null => {
  let model: Array<number | string> = Array.from(
    { length: letters.length },
    (_, index) => index
  );

  for (const delta of deltas) {
    const next: Array<number | string> = [];
    let at = 0;

    for (const part of delta) {
      if (part.retain !== undefined) {
        next.push(...model.slice(at, at + part.retain));
        at += part.retain;
      } else if (part.delete !== undefined) {
        at += part.delete;
      } else if (typeof part.insert === 'string') {
        next.push(...part.insert.split(''));
      } else {
        return null;
      }
    }
    next.push(...model.slice(at));
    model = next;
  }

  const diff: Diff[] = [];
  let kept = 0;

  for (const entry of model) {
    if (typeof entry === 'string') {
      pushDiff(diff, DiffOp.Insert, entry);
      continue;
    }
    pushDiff(diff, DiffOp.Delete, letters.slice(kept, entry));
    pushDiff(diff, DiffOp.Equal, letters[entry]);
    kept = entry + 1;
  }
  pushDiff(diff, DiffOp.Delete, letters.slice(kept));

  return diff;
};

const sameStructure = (
  left: JsonToken | undefined,
  right: JsonToken | undefined
) =>
  left !== undefined &&
  right !== undefined &&
  left.kind !== 'text' &&
  JSON.stringify(left) === JSON.stringify(right);

/**
 * The same change with each replacement's equal open and close tokens at
 * either edge kept instead, as a commit that replaces a join's close with an
 * equal close writes. Letters stay replaced even where they equal the old
 * ones, so a peer's concurrent delete of an old letter cannot take the new
 * one.
 */
export const withoutEqualEdges = (
  change: RootChange,
  document: DocumentIndex
): RootChange => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;
  let trimmed = false;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const value = change.data[index / 2] ?? null;

    if (inserted <= 0 || length === 0) {
      addSection(sections, data, length, inserted, value);
      position += length;
      continue;
    }

    const removed = document.slice(position, position + length).tokens;
    const { tokens } = value as PreparedTokenSlice;
    let head = 0;

    while (
      head < removed.length &&
      head < tokens.length &&
      sameStructure(removed[head], tokens[head])
    ) {
      head += 1;
    }

    let tail = 0;

    while (
      tail < removed.length - head &&
      tail < tokens.length - head &&
      sameStructure(
        removed[removed.length - 1 - tail],
        tokens[tokens.length - 1 - tail]
      )
    ) {
      tail += 1;
    }

    if (head === 0 && tail === 0) {
      addSection(sections, data, length, inserted, value);
    } else {
      const kept = PreparedTokenSlice.fromTokens(
        tokens.slice(head, tokens.length - tail)
      );

      trimmed = true;
      addSection(sections, data, head, -1, null);
      if (length - head - tail > 0 || kept.length > 0) {
        addSection(sections, data, length - head - tail, kept.length, kept);
      }
      addSection(sections, data, tail, -1, null);
    }
    position += length;
  }

  return trimmed ? RootChange.fromSections(sections, data) : change;
};
