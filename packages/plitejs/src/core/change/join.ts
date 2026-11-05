import { getDefined } from '../../internal/get-defined';
import { textPropertiesEqual } from '../value-codec';
import { countCoreWork } from '../work';
import type { DocumentIndex } from './document-index';
import { jsonEqual } from './json';
import type { ReadBack } from './read-back';
import {
  addSection,
  insertedElementsOf,
  insertNodeChange,
  mergeNodeChange,
  moveNodeChange,
  removeNodeChange,
  RootChange,
  type SectionData,
} from './root-change';
import {
  isElementNode,
  isTextNode,
  type JsonElementNode,
  type JsonToken,
  nodeProps,
  openToken,
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
} from './tokens';

type Range = Readonly<{ from: number; to: number }>;

type Run = Range & { inserted: PreparedTokenSlice };

/**
 * A deletion that joins a line into an earlier sibling line. It removes the
 * first line's close, every line between them, or the one empty text between
 * two inline lines, and the second line's open, with text, whole texts or
 * inline elements at either line's edge.
 *
 * @internal
 */
export type Join = Readonly<{
  first: Range;
  from: number;
  /** Where the second line's kept content starts. */
  junction: number;
  /** The tokens a rebase keeps so the meeting texts stay apart. */
  kept: readonly Range[];
  /** The tokens a rebase keeps when the other side removes a joined line. */
  keptApart: readonly Range[];
  meetsAtElements: boolean;
  /** Whole lines between the two that the change copies after the joined line. */
  run: Range | null;
  second: Range;
  to: number;
  typed: PreparedTokenSlice;
  /** Where the other side's inserts land between the two lines' texts. */
  window: Range;
}>;

const lineAt = (document: DocumentIndex, position: number) => {
  const text = document.textAt(position);

  if (text) {
    return {
      index: -1,
      path: text.path.slice(0, -1),
      text: document.nodeRange(text.path),
    };
  }

  const boundary = document.childBoundaryAt(position);

  return (
    boundary && { index: boundary.index, path: boundary.parentPath, text: null }
  );
};

const holdsOnlyEmptyText = ({ children }: JsonElementNode) =>
  children.length === 1 && isTextNode(children[0]) && children[0].text === '';

const joinIn = (
  document: DocumentIndex,
  from: number,
  to: number,
  typed: PreparedTokenSlice
) => {
  const left = lineAt(document, from);
  const right = lineAt(document, to);

  if (
    !left ||
    !right ||
    left.path.length === 0 ||
    right.path.length !== left.path.length ||
    (left.text === null) !== (right.text === null) ||
    (typed.length > 0 && !left.text)
  ) {
    return null;
  }

  const firstIndex = getDefined(left.path.at(-1));
  const secondIndex = getDefined(right.path.at(-1));
  const parent = left.path.slice(0, -1);

  if (
    secondIndex <= firstIndex ||
    parent.some((part, index) => right.path[index] !== part)
  ) {
    return null;
  }

  const firstNode = document.node(left.path);
  const secondNode = document.node(right.path);
  const next = document.node([...parent, firstIndex + 1]);
  // Neighbouring inline lines have an empty text between them, which the
  // join removes with them.
  const spacer =
    secondIndex === firstIndex + 2 && isTextNode(next) && next.text === '';

  if (
    !isElementNode(firstNode) ||
    !isElementNode(secondNode) ||
    !(isElementNode(next) || spacer) ||
    holdsOnlyEmptyText(secondNode)
  ) {
    return null;
  }

  const first = document.nodeRange(left.path);
  const second = document.nodeRange(right.path);
  const lastIndex = firstNode.children.length - 1;
  const last = firstNode.children.at(-1);
  const lastIsText = last !== undefined && isTextNode(last);
  const emptyLast = left.index === lastIndex && lastIsText && last.text === '';
  const [head] = secondNode.children;
  const headIsText = head !== undefined && isTextNode(head);
  const leftKept = left.text
    ? { from: left.text.to - 1, to: left.text.to }
    : emptyLast
      ? { from, to: from + 2 }
      : null;
  const rightKept = right.text
    ? { from: right.text.from, to: right.text.from + 1 }
    : null;

  return {
    first,
    from,
    junction: rightKept?.from ?? to,
    kept: [leftKept, rightKept].filter((range) => range !== null),
    keptApart: [
      leftKept,
      { from: first.to - 1, to: first.to },
      { from: second.from, to: second.from + 1 },
      rightKept,
    ].filter((range) => range !== null),
    meetsAtElements: !left.text && !lastIsText && !headIsText,
    second,
    to,
    typed,
    window: {
      from: lastIsText ? first.to - 2 : first.to - 1,
      to: headIsText ? second.from + 2 : second.from + 1,
    },
  };
};

const editRuns = (change: RootChange) => {
  const { data, sections } = change;
  const runs: Run[] = [];
  let position = 0;

  for (let index = 0; index < sections.length;) {
    if (sections[index + 1] < 0) {
      position += sections[index];
      index += 2;
      continue;
    }

    const from = position;
    let inserted = PreparedTokenSlice.empty;

    while (index < sections.length && sections[index + 1] >= 0) {
      position += sections[index];
      inserted = inserted.concat(
        (data[index / 2] as PreparedTokenSlice | null) ??
          PreparedTokenSlice.empty
      );
      index += 2;
    }

    runs.push({ from, inserted, to: position });
  }

  return runs;
};

const someRunDeletesTwoTokens = ({ sections }: RootChange) => {
  let deleted = 0;

  for (let index = 0; index < sections.length; index += 2) {
    deleted = sections[index + 1] < 0 ? 0 : deleted + sections[index];
    if (deleted >= 2) return true;
  }

  return false;
};

const withinText = (document: DocumentIndex, from: number, to: number) => {
  const text = document.textAt(from);

  return text !== null && to <= text.contentTo;
};

/**
 * Read each edit of a change that deletes only a join, with the text on
 * either side of it, and inserts nothing or only plain text, as typing over a
 * selection across two lines does. A join whose change also copies the whole
 * lines it deletes between the two lines, unchanged, right after the joined
 * line moves those lines.
 *
 * @internal
 */
export const joinsOf = (change: RootChange, document: DocumentIndex) => {
  if (!someRunDeletesTwoTokens(change)) return [];

  const runs = editRuns(change);

  return runs.flatMap(({ from, inserted, to }, index): Join[] => {
    const join =
      to - from >= 2 &&
      !withinText(document, from, to) &&
      inserted.tokens.every((token) => token.kind === 'text')
        ? joinIn(document, from, to, inserted)
        : null;

    if (!join) return [];

    const between = { from: join.first.to, to: join.second.from };
    const length = between.to - between.from;
    const next = runs[index + 1];
    const moves =
      length > 0 &&
      next?.from === join.second.to &&
      next.to === next.from &&
      next.inserted.length >= length &&
      jsonEqual(
        next.inserted.slice(0, length).toJSON(),
        document.slice(between.from, between.to).toJSON()
      );

    return [{ ...join, run: moves ? between : null }];
  });
};

/** @internal */
export type Lift = Readonly<{
  cut: number;
  joinRun: Range;
  lifted: DocumentIndex;
  movedLine: Range;
  move: RootChange;
  movesMore: boolean;
  rest: RootChange;
}>;

/** @internal */
export const liftOf = (
  change: RootChange,
  document: DocumentIndex
): Lift | null => {
  if (!someRunDeletesTwoTokens(change)) return null;

  const runs = editRuns(change);

  for (let first = 0; first < runs.length; first += 1) {
    const head = runs[first];
    const text = document.textAt(head.from);

    if (!text || head.to <= text.contentTo || head.inserted.length === 0) {
      continue;
    }

    const linePath = text.path.slice(0, -1);
    const lineRange = document.nodeRange(linePath);
    const closes = document.slice(text.contentTo, head.to).tokens;

    if (
      linePath.length === 0 ||
      head.to < lineRange.to ||
      !closes.every((token) => token.kind === 'close')
    ) {
      continue;
    }

    for (const tail of runs.slice(first + 1)) {
      const node = document.nodeStartingAt(tail.from);

      if (
        node?.kind !== 'element' ||
        node.to !== tail.to ||
        tail.inserted.length > 0 ||
        node.path.length === linePath.length
      ) {
        continue;
      }

      const second = document.node(node.path);
      const last = isElementNode(second) ? second.children.at(-1) : undefined;

      if (!last || !isTextNode(last) || !isElementNode(second)) continue;

      const secondText = document.nodeRange([
        ...node.path,
        second.children.length - 1,
      ]);
      const inserted = head.inserted.toJSON();
      const starts: number[] = [];
      let position = 0;

      for (const token of inserted) {
        starts.push(position);
        position += token.kind === 'text' ? token.text.length : 1;
      }

      for (const [index, token] of inserted.entries()) {
        if (token.kind !== 'text') continue;

        const keptText = token.text;
        const cut = secondText.to - 1 - keptText.length;

        if (cut <= secondText.from || !last.text.endsWith(keptText)) continue;

        const kept = document.slice(cut, tail.to).toJSON();
        const lift =
          jsonEqual(inserted.slice(index, index + kept.length), kept) &&
          liftAround(change, document, runs, head, tail, {
            before: getDefined(starts[index]),
            cut,
            linePath,
            lineTo: lineRange.to,
            secondPath: node.path,
          });

        if (lift) return lift;
      }
    }
  }

  return null;
};

const liftAround = (
  change: RootChange,
  document: DocumentIndex,
  runs: readonly Run[],
  head: Run,
  tail: Run,
  {
    before,
    cut,
    linePath,
    lineTo,
    secondPath,
  }: Readonly<{
    before: number;
    cut: number;
    linePath: readonly number[];
    lineTo: number;
    secondPath: readonly number[];
  }>
): Lift | null => {
  let move: RootChange;

  try {
    move = moveNodeChange(document, secondPath, [
      ...linePath.slice(0, -1),
      getDefined(linePath.at(-1)) + 1,
    ]);
  } catch {
    return null;
  }

  const lifted = move.apply(document);
  const length = tail.to - tail.from;
  const shift = (position: number) =>
    position >= lineTo && position < tail.from ? position + length : position;
  const prefix = head.inserted.slice(0, before);
  const kept = head.inserted.slice(
    before + document.slice(cut, tail.to).length
  );
  const sections: number[] = [];
  const data: SectionData[] = [];
  const edits: Array<Run | { at: number; data: SectionData }> = [...runs];
  let position = 0;

  for (let index = 0, at = 0; index < change.sections.length; index += 2) {
    if (change.sections[index + 1] === -2) {
      if (at >= tail.from && at < tail.to) return null;
      edits.push({ at, data: change.data[index >> 1] ?? null });
    }
    at += change.sections[index];
  }
  edits.sort(
    (x, y) => ('at' in x ? x.at : x.from) - ('at' in y ? y.at : y.from)
  );

  for (const run of edits) {
    if ('at' in run) {
      const from = shift(run.at);

      addSection(sections, data, from - position, -1, null);
      addSection(sections, data, 1, -2, run.data);
      position = from + 1;
      continue;
    }
    if (run === tail) continue;
    if (run === head) {
      const joinTo = lineTo + cut - tail.from;

      addSection(sections, data, run.from - position, -1, null);
      addSection(sections, data, joinTo - run.from, prefix.length, prefix);
      addSection(sections, data, lineTo + length - joinTo, -1, null);
      addSection(sections, data, head.to - lineTo, kept.length, kept);
      position = head.to + length;
      continue;
    }

    const from = shift(run.from);

    addSection(sections, data, from - position, -1, null);
    addSection(
      sections,
      data,
      run.to - run.from,
      run.inserted.length,
      run.inserted
    );
    position = from + run.to - run.from;
  }
  addSection(sections, data, lifted.length - position, -1, null);

  const rest = RootChange.fromSections(sections, data);

  if (rest.length !== lifted.length) return null;

  const after = applyIfNested(rest, lifted);

  if (!after || !jsonEqual(after.value, change.apply(document).value)) {
    return null;
  }

  return {
    cut,
    movesMore: edits.length > 2 || before > 0 || kept.length > 0,
    joinRun: { from: head.from, to: head.to },
    lifted,
    movedLine: { from: tail.from, to: tail.to },
    move,
    rest,
  };
};

const editsInsideWrap = (
  lifting: RootChange,
  lift: Lift,
  other: RootChange,
  document: DocumentIndex
) => {
  const wraps = insertedElementsOf(other, document).filter(
    ({ close, open }) => open.to < close.from
  );

  return editRuns(lifting).some(
    (run) =>
      run.from !== lift.joinRun.from &&
      run.from !== lift.movedLine.from &&
      !staysInLine(document, run) &&
      wraps.some(
        ({ close, open }) => open.to < run.from && run.from < close.from
      )
  );
};

const staysInLine = (document: DocumentIndex, { from, inserted, to }: Run) => {
  const start = document.nodeStartingAt(from);
  const textPath =
    document.textAt(from)?.path ?? (start?.kind === 'text' ? start.path : null);

  if (!textPath || to >= document.nodeRange(textPath.slice(0, -1)).to) {
    return false;
  }

  let depth = 0;

  return inserted.tokens.every((token) => {
    depth += depthChange(token);

    return depth >= -1;
  });
};

type TransformOptions = Parameters<typeof RootChange.transformInDocument>[3];

const touchesInside = (change: RootChange, { from, to }: Range) =>
  editedRanges(change).some(
    (range) => range.to > from + 1 && range.from < to - 1
  );

const overMove = (
  edit: RootChange,
  lift: Lift,
  document: DocumentIndex,
  options: TransformOptions
) => {
  if (touchesInside(edit, lift.movedLine)) {
    const carried = RootChange.transformInDocument(
      edit,
      lift.move,
      document,
      options
    );

    return { edit: carried.a, move: carried.b };
  }

  const { a: move, b: moved } = RootChange.transform(lift.move, edit);

  return { edit: moved, move };
};

export const editsInMovedLine = (
  edit: RootChange,
  step: RootChange,
  document: DocumentIndex
) => {
  const runs = editRuns(edit);
  const lift = runs.length > 0 ? liftOf(step, document) : null;

  return (
    lift !== null &&
    runs.every(
      ({ from, to }) =>
        from > lift.movedLine.from &&
        to < lift.movedLine.to &&
        document.textAt(from) !== null
    )
  );
};

/** @internal */
export const rebaseOverLift = (
  a: RootChange,
  b: RootChange,
  document: DocumentIndex,
  options: TransformOptions
) => ifNested(() => liftRebase(a, b, document, options));

const liftRebase = (
  a: RootChange,
  b: RootChange,
  document: DocumentIndex,
  options: TransformOptions
) => {
  const bLift = liftOf(b, document);
  const aLift = bLift ? null : liftOf(a, document);

  if (bLift) {
    if (editsInsideWrap(b, bLift, a, document)) return null;

    const first = overMove(a, bLift, document, options);
    const second = RootChange.transformInDocument(
      first.edit,
      bLift.rest,
      bLift.lifted,
      options
    );

    return convergedResult(document, a, b, {
      a: second.a,
      b: first.move.compose(second.b),
    });
  }
  if (aLift) {
    if (editsInsideWrap(a, aLift, b, document)) return null;

    const first = overMove(b, aLift, document, options);
    const second = RootChange.transformInDocument(
      aLift.rest,
      first.edit,
      aLift.lifted,
      options
    );

    return convergedResult(document, a, b, {
      a: first.move.compose(second.a),
      b: second.b,
    });
  }

  return null;
};

/**
 * Whether a change removes either line of a join whole, and whether it also
 * inserts an equal line, as a move written as a removal and an insert does.
 */
const removedJoinedLines = (change: RootChange, document: DocumentIndex) => {
  const runs = editRuns(change);
  const removed = (join: Join) =>
    [join.first, join.second].filter((line) =>
      runs.some(({ from, to }) => from <= line.from && line.to <= to)
    );
  const inserts = (line: Range) => {
    const json = document.slice(line.from, line.to).toJSON();

    return runs.some(({ inserted }) => {
      const tokens = inserted.toJSON();

      return tokens.some(
        (_, at) =>
          at + json.length <= tokens.length &&
          jsonEqual(tokens.slice(at, at + json.length), json)
      );
    });
  };

  return {
    moves: (join: Join) => removed(join).some(inserts),
    removes: (join: Join) => removed(join).length > 0,
  };
};

const depthChange = ({ kind }: JsonToken) =>
  kind === 'open' ? 1 : kind === 'close' ? -1 : 0;

const isWholeLines = (tokens: readonly JsonToken[]) => {
  let depth = 0;

  for (const token of tokens) {
    if (
      depth === 0 &&
      (token.kind !== 'open' || token.nodeKind !== 'element')
    ) {
      return false;
    }

    depth += depthChange(token);
    if (depth < 0) return false;
  }

  return depth === 0;
};

const sliceOf = (tokens: readonly JsonToken[]) =>
  PreparedTokenSlice.fromTokens(tokens);

/**
 * Split what the other side inserts between a join's two texts by the line it
 * lands in once both apply. Text restored at the first line's end stays in
 * that line, and text restored at the second line's start stays with that
 * text. Every whole line between moves to after the joined line.
 */
const splitAtJoin = (
  document: DocumentIndex,
  join: Join,
  position: number,
  slice: PreparedTokenSlice
) => {
  const { tokens } = slice;

  if (position >= join.first.to && position <= join.second.from) {
    return isWholeLines(tokens)
      ? { moved: slice, stay: { from: 0, to: 0 } }
      : null;
  }

  const depth = document.textAt(position) ? 2 : 1;
  let level = 0;
  let end = 0;

  while (end < tokens.length && level + depthChange(tokens[end]) > -depth) {
    level += depthChange(tokens[end]);
    end += 1;
  }

  const start = end - depth + 1;
  const closes = tokens.slice(start, end + 1);
  const open: number[] = [];
  let line = end + 1;

  for (let index = end + 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (open.length === 0) {
      if (token.kind !== 'open' || token.nodeKind !== 'element') return null;
      line = index;
    }
    if (token.kind === 'open') open.push(index);
    if (token.kind === 'close') open.pop();
  }

  if (
    end === tokens.length ||
    open.length !== depth ||
    closes.some((token, index) => {
      const opened = tokens[open[depth - 1 - index]];

      return (
        token.kind !== 'close' ||
        opened.kind !== 'open' ||
        opened.nodeKind !== token.nodeKind
      );
    })
  ) {
    return null;
  }

  if (position < join.first.to) {
    return {
      moved: sliceOf([...tokens.slice(end + 1), ...closes]),
      stay: { from: 0, to: sliceOf(tokens.slice(0, start)).length },
    };
  }

  if (open.some((at, index) => at !== line + index)) return null;

  return {
    moved: document
      .slice(join.second.from, position)
      .concat(sliceOf(tokens.slice(0, line))),
    stay: {
      from: sliceOf(tokens.slice(0, line + depth)).length,
      to: slice.length,
    },
  };
};

type Rewrite = Readonly<{
  /** The rewritten change over the original document. */
  change: RootChange;
  /** The change from the original change's result to the rewritten one's. */
  fix: RootChange;
  settlePoints: readonly number[];
}>;

/**
 * Rewrite a change for a positional rebase: its joins keep the meeting texts
 * apart, a join whose line the other side removes keeps only its text edits,
 * and what it inserts between the other side's joined lines moves to after
 * the joined line.
 */
const rewrite = (
  change: RootChange,
  document: DocumentIndex,
  joins: readonly Join[],
  moot: (join: Join) => boolean,
  others: readonly Join[],
  other: RootChange
): Rewrite | null => {
  const byFrom = new Map(joins.map((join) => [join.from, join]));
  const sections: number[] = [];
  const data: SectionData[] = [];
  const restored: Array<{ at: number; slice: PreparedTokenSlice }> = [];
  let result: DocumentIndex | undefined;
  let otherDeletes: ((at: number) => boolean) | undefined;
  let position = 0;

  for (let index = 0; index < change.sections.length;) {
    const join = byFrom.get(position);
    const kept = join && (moot(join) ? join.keptApart : join.kept);

    if (join && kept?.length && change.sections[index + 1] >= 0) {
      result ??= change.apply(document);
      const after = result;
      // The second text's letters join the first text, so a mark the same
      // change sets across the junction is on the joined text, not on the
      // second text's open.
      const reopened = kept.map((range) => {
        if (range.from !== join.junction) return null;

        const [open] = document.slice(range.from, range.to).tokens;
        const joined = getDefined(
          after.textAt(getDefined(change.mapPos(join.to, 1)))
        );
        const props = nodeProps(after.node(joined.path));

        return open.kind === 'open' && !jsonEqual(open.props, props)
          ? PreparedTokenSlice.fromTokens([openToken('text', props)])
          : null;
      });
      let at = join.from;

      for (const [order, range] of kept.entries()) {
        const open = reopened[order];
        const typed = order === 0 ? join.typed : PreparedTokenSlice.empty;
        const typedReplacesKept =
          typed.length > 0 &&
          range.from === at &&
          !open &&
          !(otherDeletes ??= deletionsOf(other))(at);

        if (typedReplacesKept) {
          addSection(
            sections,
            data,
            1,
            typed.length + 1,
            typed.concat(document.slice(at, at + 1))
          );
          addSection(sections, data, range.to - at - 1, -1, null);
        } else {
          addSection(sections, data, range.from - at, typed.length, typed);
          addSection(
            sections,
            data,
            range.to - range.from,
            open?.length ?? -1,
            open
          );
        }
        at = range.to;
      }
      addSection(sections, data, join.to - at, 0, PreparedTokenSlice.empty);
      restored.push({
        at: getDefined(change.mapPos(join.from, -1)) + join.typed.length,
        slice: PreparedTokenSlice.concat(
          kept.map(
            (range, order) =>
              reopened[order] ?? document.slice(range.from, range.to)
          )
        ),
      });

      while (
        index < change.sections.length &&
        change.sections[index + 1] >= 0
      ) {
        position += change.sections[index];
        index += 2;
      }
    } else {
      const value = change.data[index / 2] ?? null;
      const typedAfterDeletion =
        change.sections[index] === 0 &&
        sections.at(-1) === 0 &&
        (sections.at(-2) ?? 0) > 0 &&
        value instanceof PreparedTokenSlice &&
        value.tokens.every((token) => token.kind === 'text');

      addSection(
        sections,
        data,
        change.sections[index],
        change.sections[index + 1],
        value,
        typedAfterDeletion
      );
      position += change.sections[index];
      index += 2;
    }
  }

  const apart = RootChange.fromSections(sections, data);
  const apartFix =
    result === undefined
      ? RootChange.empty(change.newLength)
      : RootChange.create(
          result,
          restored.map(({ at, slice }) => ({ from: at, insert: slice, to: at }))
        );
  const live = others.filter((join) => !moot(join));
  const cuts: Range[] = [];
  const moved = new Map<Join, PreparedTokenSlice[]>();

  position = 0;
  for (let index = 0; index < apart.sections.length; index += 2) {
    if (apart.sections[index] === 0 && apart.sections[index + 1] > 0) {
      const slice = apart.data[index / 2] as PreparedTokenSlice;
      const join = live.find(
        ({ window }) => window.from <= position && position <= window.to
      );
      const split = join && splitAtJoin(document, join, position, slice);

      // Only whole lines can move out from between two lines, so an insert
      // into the empty text between two inline lines takes no rebase by
      // position.
      if (
        join &&
        !split &&
        join.first.to <= position &&
        position <= join.second.from
      ) {
        return null;
      }
      if (join && split) {
        const at = getDefined(apart.mapPos(position, -1));

        cuts.push(
          { from: at, to: at + split.stay.from },
          { from: at + split.stay.to, to: at + slice.length }
        );
        moved.set(join, [...(moved.get(join) ?? []), split.moved]);
      }
    }

    position += apart.sections[index];
  }

  const chainEnds = new Map<Join, number>();

  if (moved.size > 0) {
    const byFirst = new Map(live.map((join) => [join.first.from, join]));

    for (const join of [...live].sort((x, y) => y.from - x.from)) {
      const next = byFirst.get(join.second.from);

      chainEnds.set(
        join,
        next ? getDefined(chainEnds.get(next)) : join.second.to
      );
    }
  }

  const moveFix =
    moved.size === 0
      ? RootChange.empty(apart.newLength)
      : RootChange.create(
          apart.apply(document),
          [
            ...cuts.filter(({ from, to }) => from < to),
            ...[...moved].map(([join, slices]) => {
              const at = getDefined(
                apart.mapPos(getDefined(chainEnds.get(join)), -1)
              );

              return {
                from: at,
                insert: PreparedTokenSlice.concat(slices),
                to: at,
              };
            }),
          ].sort((left, right) => left.from - right.from)
        );
  const rewritten = apart.compose(moveFix);

  return {
    change: rewritten,
    fix: apartFix.compose(moveFix),
    settlePoints: joins
      .flatMap((join) =>
        join.meetsAtElements
          ? []
          : moot(join)
            ? [join.first.from + 1, join.second.from + 1]
            : [join.junction]
      )
      .map((at) => getDefined(rewritten.mapPos(at, 1))),
  };
};

const deletionsOf = (change: RootChange) => {
  const ends: number[] = [];
  const edits: boolean[] = [];
  let position = 0;

  countCoreWork('sectionsWalked', change.sections.length / 2);
  for (let index = 0; index < change.sections.length; index += 2) {
    position += change.sections[index];
    ends.push(position);
    edits.push(change.sections[index + 1] >= 0);
  }

  return (at: number) => {
    let low = 0;
    let high = ends.length;

    while (low < high) {
      const middle = (low + high) >> 1;

      if (ends[middle] <= at) low = middle + 1;
      else high = middle;
    }

    return low < ends.length && edits[low];
  };
};

const hasNoProperties = (text: object) => Object.keys(text).length === 1;

/**
 * Settle the two texts that meet at a position by a rule on those two texts
 * alone: texts whose properties match join; otherwise an empty one goes,
 * because the other is the spacer an inline element beside it needs, and of
 * two empty texts the one with no properties stays, else the first.
 */
const settleAt = (document: DocumentIndex, at: number) => {
  const right = document.nodeStartingAt(at);
  const index = right?.path.at(-1);

  if (right?.kind !== 'text' || !index) return null;

  const leftPath = [...right.path.slice(0, -1), index - 1];
  const left = document.node(leftPath);
  const text = document.node(right.path);

  if (!isTextNode(left) || !isTextNode(text)) return null;
  if (textPropertiesEqual(left, text)) {
    return mergeNodeChange(document, right.path);
  }
  if (left.text !== '' && text.text !== '') return null;

  const dropsLeft =
    text.text !== '' ||
    (left.text === '' && hasNoProperties(text) && !hasNoProperties(left));

  return removeNodeChange(document, dropsLeft ? leftPath : right.path);
};

const settleAround = (document: DocumentIndex, at: number) => {
  const start = document.nodeStartingAt(at);
  const path = start?.kind === 'text' ? start.path : document.textAt(at)?.path;

  if (!path) return null;

  const { from, to } = document.nodeRange(path);

  return settleAt(document, from) ?? settleAt(document, to);
};

const settleEmptyLine = (document: DocumentIndex, at: number) => {
  const line = lineAt(document, at);

  if (!line || line.path.length === 0) return null;

  const node = document.node(line.path);

  if (!isElementNode(node)) return null;
  if (node.children.length === 0) {
    return insertNodeChange(document, [...line.path, 0], { text: '' });
  }

  const [only] = node.children;

  if (
    node.children.length !== 1 ||
    !isTextNode(only) ||
    only.text !== '' ||
    hasNoProperties(only)
  ) {
    return null;
  }

  return RootChange.create(document, {
    from: document.nodeRange([...line.path, 0]).from,
    properties: {
      unset: Object.keys(only).filter((key) => key !== 'text'),
    },
  });
};

const lacksInlineSpacer = (document: DocumentIndex, at: number) => {
  const line = lineAt(document, at);
  const node = line && line.path.length > 0 ? document.node(line.path) : null;

  if (!node || !isElementNode(node)) return false;

  const { children } = node;

  if (!children.some(isTextNode) || children.every(isTextNode)) return false;

  return (
    !isTextNode(children[0]) ||
    !isTextNode(getDefined(children.at(-1))) ||
    children.some(
      (child, index) =>
        index > 0 && !isTextNode(child) && !isTextNode(children[index - 1])
    )
  );
};

const settleJunctions = (document: DocumentIndex, positions: number[]) => {
  let change = RootChange.empty(document.length);
  let current = document;

  for (const position of [...new Set(positions)].sort((x, y) => y - x)) {
    let at = position;
    let settled = settleAround(current, at) ?? settleEmptyLine(current, at);

    while (settled) {
      current = settled.apply(current);
      change = change.compose(settled);
      at = getDefined(settled.mapPos(at, 1));
      settled = settleAround(current, at) ?? settleEmptyLine(current, at);
    }
  }

  return change;
};

const editedRanges = (change: RootChange) => {
  const ranges: Range[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];

    if (change.sections[index + 1] !== -1) {
      ranges.push({ from: position, to: position + length });
    }

    position += length;
  }

  return ranges;
};

const ifNested = <T>(run: () => T) => {
  try {
    return run();
  } catch (error) {
    if (error instanceof PreparedTokenSliceStructureError) return null;
    throw error;
  }
};

const applyIfNested = (change: RootChange, document: DocumentIndex) =>
  ifNested(() => change.apply(document));

/** @internal */
export const convergedResult = (
  document: DocumentIndex,
  a: RootChange,
  b: RootChange,
  result: Readonly<{ a: RootChange; b: RootChange }>
) => {
  const viaB = applyIfNested(result.a, b.apply(document));
  const viaA = applyIfNested(result.b, a.apply(document));

  if (!viaB || !viaA) return null;

  const x = b.compose(result.a);
  const y = a.compose(result.b);
  const ranges: Array<{ from: number; to: number }> = [];

  for (const range of [...editedRanges(x), ...editedRanges(y)].sort(
    (left, right) => left.from - right.from
  )) {
    const last = ranges.at(-1);

    if (last && range.from <= last.to) {
      last.to = Math.max(last.to, range.to);
    } else {
      ranges.push({ ...range });
    }
  }

  const read = (
    change: RootChange,
    after: DocumentIndex,
    { from, to }: Range
  ) => {
    const start = change.mapPos(from, -1);
    const end = change.mapPos(to, 1);

    return start === null || end === null
      ? null
      : after.slice(start, end).toJSON();
  };
  const same = ranges.every((range) => {
    const left = read(x, viaB, range);

    return left !== null && jsonEqual(left, read(y, viaA, range));
  });

  return same ? result : null;
};

const shifted = (change: RootChange, by: number, length: number) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;
  let at = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const size = change.sections[index];

    if (change.sections[index + 1] !== -1) {
      addSection(sections, data, position + by - at, -1, null);
      addSection(
        sections,
        data,
        size,
        change.sections[index + 1],
        change.data[index / 2] ?? null
      );
      at = position + by + size;
    }

    position += size;
  }
  addSection(sections, data, length - at, -1, null);

  return RootChange.fromSections(sections, data);
};

/**
 * Rebase an edit inside a join's moved run onto the run's copy after the
 * joined line, and copy the run as that edit leaves it.
 */
const intoRun = (
  join: Join,
  run: Range,
  joined: RootChange,
  edit: RootChange,
  document: DocumentIndex
) => {
  const length = run.to - run.from;
  const delta = edit.newLength - edit.length;
  const copy = edit.apply(document).slice(run.from, run.to + delta);
  const sections: number[] = [];
  const data: SectionData[] = [];
  let position = 0;
  let deletes = false;
  let copies = false;

  for (let index = 0; index < joined.sections.length; index += 2) {
    const size = joined.sections[index];
    const inserted = joined.sections[index + 1];
    const value = joined.data[index / 2] ?? null;

    if (inserted >= 0 && position <= run.from && run.to <= position + size) {
      addSection(sections, data, size + delta, inserted, value);
      deletes = true;
    } else if (
      size === 0 &&
      inserted >= length &&
      position === join.second.to &&
      !copies
    ) {
      const slice = copy.concat((value as PreparedTokenSlice).slice(length));

      addSection(sections, data, 0, slice.length, slice);
      copies = true;
    } else {
      addSection(sections, data, size, inserted, value);
    }

    position += size;
  }

  if (!deletes || !copies) return null;

  return {
    edit: shifted(
      edit,
      getDefined(joined.mapPos(join.second.to, -1)) - run.from,
      joined.newLength
    ),
    joined: RootChange.fromSections(sections, data),
  };
};

const insideRun = (change: RootChange, run: Range) => {
  const ranges = editedRanges(change);

  return (
    ranges.length > 0 &&
    ranges.every(({ from, to }) =>
      from === to
        ? run.from < from && from < run.to
        : run.from <= from && to <= run.to
    )
  );
};

const rebaseIntoRun = (
  joined: RootChange,
  joins: readonly Join[],
  edit: RootChange,
  document: DocumentIndex
) => {
  for (const join of joins) {
    if (join.run && insideRun(edit, join.run)) {
      return intoRun(join, join.run, joined, edit, document);
    }
  }

  return null;
};

/**
 * Rebase two changes over each other's joins by position. What one side
 * inserts between the other's joined lines moves after the joined line, an
 * edit inside a join's moved run follows the run, each join keeps the meeting
 * texts apart for the rebase, and the junctions settle once both sides apply.
 *
 * @internal
 */
export const rebaseOverJoins = (
  a: RootChange,
  b: RootChange,
  document: DocumentIndex,
  replayBase: DocumentIndex | undefined,
  readBack: ReadBack | null = null
) => {
  const aJoins = joinsOf(a, document);
  const bJoins = joinsOf(b, document);

  if (aJoins.length === 0 && bJoins.length === 0) return null;

  const aRun = rebaseIntoRun(a, aJoins, b, document);
  const bRun = aRun ? null : rebaseIntoRun(b, bJoins, a, document);

  if (aRun) {
    return convergedResult(document, a, b, { a: aRun.joined, b: aRun.edit });
  }
  if (bRun) {
    return convergedResult(document, a, b, { a: bRun.edit, b: bRun.joined });
  }

  const aMoot = removedJoinedLines(b, document);
  const bMoot = removedJoinedLines(a, document);

  if (aJoins.some(aMoot.moves) || bJoins.some(bMoot.moves)) return null;

  const aRewrite = rewrite(a, document, aJoins, aMoot.removes, bJoins, b);
  const bRewrite = rewrite(b, document, bJoins, bMoot.removes, aJoins, a);

  if (!aRewrite || !bRewrite) return null;

  const { a: aOverB, b: bOverA } = RootChange.transform(
    aRewrite.change,
    bRewrite.change,
    replayBase,
    readBack
  );
  const aApart = applyIfNested(aRewrite.change, document);
  const throughA = aApart && applyIfNested(bOverA, aApart);

  if (!throughA) return null;

  const insideChange = (over: RootChange, at: number) =>
    over.mapPos(at, -1, 'around') === null;
  const landed = (over: RootChange) => (at: number) =>
    insideChange(over, at)
      ? []
      : [getDefined(over.mapPos(at, -1)), getDefined(over.mapPos(at, 1))];
  const points = [
    ...aRewrite.settlePoints.flatMap(landed(bOverA)),
    ...bRewrite.settlePoints.flatMap(landed(aOverB)),
  ];
  const settle = settleJunctions(throughA, points);
  const settled = settle.apply(throughA);

  if (
    points.some((at) =>
      lacksInlineSpacer(settled, getDefined(settle.mapPos(at, 1)))
    )
  ) {
    return null;
  }

  return convergedResult(document, a, b, {
    a: bRewrite.fix.compose(aOverB).compose(settle),
    b: aRewrite.fix.compose(bOverA).compose(settle),
  });
};
