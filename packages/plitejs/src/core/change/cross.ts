import { countCoreWork } from '../work';
import type { FactedChange } from './cross-rule';
import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentChangeEntries,
  valueRootIndex,
} from './document-change';
import type { DocumentIndex } from './document-index';
import {
  type Carry,
  type ChangeFacts,
  type Heir,
  type Merge,
  NO_FACTS,
  type RootFacts,
  recordedFacts,
} from './record';
import {
  addSection,
  applyPropertyModificationsToSlice,
  RootChange,
  type SectionData,
} from './root-change';
import { type JsonEditorValue, PreparedTokenSlice } from './tokens';
import type { PropertyModification } from './transform';

/**
 * The step as a change on the document the skipped change left, and the
 * skipped change as a change on the document the step left. Applying the
 * skipped change then `followed`, or the step then `leftover`, gives one
 * document. The leftover holds carries only, so the next older step crosses
 * it the same way.
 *
 * @internal
 */
export type Crossing = Readonly<{
  followed: FactedChange;
  leftover: FactedChange;
}>;

const fail = (why: string): never => {
  throw new Error(`crossRecord: ${why}.`);
};

const NO_ROOT_FACTS: RootFacts = { carries: [], heirs: [], merges: [] };

const writtenRoot = (change: DocumentChange) => {
  let written: Readonly<{ change: RootChange; root: string }> | null = null;

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    if (
      rootChange.sections.every(
        (value, index) => index % 2 === 0 || value === -1
      )
    ) {
      continue;
    }
    if (written) fail('a change writes more than one root');
    written = { change: rootChange, root };
  }

  return written;
};

const rootFactsOf = (facts: ChangeFacts, root: string) =>
  facts.kind === 'recorded'
    ? (facts.roots.get(root) ?? NO_ROOT_FACTS)
    : fail('a change has unknown facts');

type Span = Readonly<{ input: number; length: number; output: number }>;

type Fresh = Readonly<{
  baseGap: number;
  length: number;
  offset: number;
  output: number;
  slice: PreparedTokenSlice;
}>;

const indexAt = <T extends Readonly<{ length: number }>>(
  spans: readonly T[],
  key: (span: T) => number,
  at: number
) => {
  let low = 0;
  let high = spans.length;

  while (low < high) {
    countCoreWork('crossingPieces');

    const middle = (low + high) >> 1;
    const span = spans[middle];

    if (key(span) + span.length <= at) low = middle + 1;
    else if (key(span) > at) high = middle;
    else return middle;
  }

  return -1;
};

const readSkipped = (
  base: DocumentIndex,
  change: RootChange,
  facts: RootFacts
) => {
  const kept: Span[] = [];
  const carried: Span[] = [];
  const fresh: Fresh[] = [];
  const written: Array<Fresh | Span> = [];
  const { carries } = facts;
  let drop = null as Readonly<{ from: number; to: number }> | null;
  let copyGap = -1;
  let input = 0;
  let output = 0;
  let carry = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];

    if (inserted === -1) {
      if (length > 0) {
        const span = { input, length, output };

        kept.push(span);
        written.push(span);
      }
      input += length;
      output += length;
      continue;
    }

    countCoreWork('crossingPieces');

    if (inserted === -2) fail('the skipped change sets a property');
    if (length > 0) {
      if (inserted > 0) fail('a skipped piece both drops and writes');
      if (drop && drop.to !== input) fail('the skipped change drops two runs');
      drop = { from: drop?.from ?? input, to: input + length };
    }

    const slice = change.data[index >> 1] as PreparedTokenSlice;
    const end = output + Math.max(inserted, 0);
    let at = output;
    let sourceGapAfterCarry: number | null = null;

    while (at < end) {
      while (
        carry < carries.length &&
        carries[carry][0] + carries[carry][2] <= at
      ) {
        countCoreWork('crossingPieces');
        carry += 1;
      }

      const next = carries[carry];
      const inCarry = next !== undefined && next[0] <= at;
      const to = Math.min(
        inCarry ? next[0] + next[2] : (next?.[0] ?? end),
        end
      );

      if (inCarry) {
        const span = {
          input: next[1] + at - next[0],
          length: to - at,
          output: at,
        };

        carried.push(span);
        written.push(span);
        sourceGapAfterCarry = next[1] + to - next[0];
        copyGap = input;
      } else {
        const run = {
          baseGap: sourceGapAfterCarry ?? input,
          length: to - at,
          offset: at - output,
          output: at,
          slice,
        };

        fresh.push(run);
        written.push(run);
      }
      at = to;
    }
    input += length;
    output += Math.max(inserted, 0);
  }

  const carriedLength = carried.reduce((sum, span) => sum + span.length, 0);

  if (carriedLength !== carries.reduce((sum, each) => sum + each[2], 0)) {
    fail('a carry of the skipped change sits outside what it writes');
  }
  if (drop && carriedLength !== drop.to - drop.from) {
    fail('the skipped change drops a run its carries do not copy');
  }

  const neither = (position: number) =>
    fail(`input position ${position} is neither kept nor carried`);

  const inDrop = (position: number) =>
    drop !== null && drop.from <= position && position < drop.to;

  const outputOf = (position: number) => {
    const spans = inDrop(position) ? carried : kept;
    const index = indexAt(spans, (each) => each.input, position);

    return index === -1
      ? neither(position)
      : spans[index].output + position - spans[index].input;
  };

  const outputRuns = (from: number, to: number) => {
    const runs: Array<{ from: number; to: number }> = [];

    for (let position = from; position < to;) {
      const spans = inDrop(position) ? carried : kept;
      let index = indexAt(spans, (each) => each.input, position);

      if (index === -1) neither(position);
      for (
        ;
        position < to && index < spans.length && spans[index].input <= position;
        index += 1
      ) {
        countCoreWork('crossingPieces');

        const span = spans[index];
        const end = Math.min(to, span.input + span.length);
        const out = span.output + position - span.input;
        const last = runs.at(-1);

        if (last?.to === out) last.to += end - position;
        else runs.push({ from: out, to: out + end - position });
        position = end;
      }
    }

    return runs;
  };

  const pastFresh = (at: number) => {
    let position = at;

    for (
      let index = indexAt(written, (each) => each.output, at);
      index !== -1 && index < written.length && 'slice' in written[index];
      index += 1
    ) {
      countCoreWork('crossingPieces');
      position = written[index].output + written[index].length;
    }

    return position;
  };

  const outputSlice = (from: number, to: number) => {
    const parts: PreparedTokenSlice[] = [];
    let index = indexAt(written, (each) => each.output, from);

    for (let at = from; at < to; index += 1) {
      countCoreWork('crossingPieces');

      const span =
        index === -1 || index >= written.length
          ? fail(`output position ${at} is written by no span`)
          : written[index];
      const end = Math.min(to, span.output + span.length);

      parts.push(
        'slice' in span
          ? span.slice.slice(
              span.offset + at - span.output,
              span.offset + end - span.output
            )
          : base.slice(
              span.input + at - span.output,
              span.input + end - span.output
            )
      );
      at = end;
    }

    return PreparedTokenSlice.concat(parts);
  };

  return {
    copyGap,
    drop,
    fresh,
    outputOf,
    outputRuns,
    outputSlice,
    pastFresh,
  };
};

type Edit = Readonly<{
  from: number;
  insert?: PreparedTokenSlice;
  modifications?: readonly PropertyModification[];
  to: number;
}>;

const changeFrom = (length: number, edits: readonly Edit[]) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  const starts: number[] = [];
  let input = 0;
  let output = 0;

  for (const edit of edits) {
    if (edit.from < input) fail('two edits of a derived change overlap');

    addSection(sections, data, edit.from - input, -1, null);
    output += edit.from - input;
    starts.push(output);
    if (edit.modifications) {
      addSection(sections, data, 1, -2, edit.modifications);
      output += 1;
    } else {
      const insert = edit.insert ?? PreparedTokenSlice.empty;

      addSection(sections, data, edit.to - edit.from, insert.length, insert);
      output += insert.length;
    }
    input = edit.to;
  }
  addSection(sections, data, length - input, -1, null);

  const outputOf = (position: number) => {
    let shift = 0;

    for (const edit of edits) {
      if (edit.to > position) {
        if (edit.from <= position && edit.from !== edit.to) {
          fail(`position ${position} is dropped by a derived change`);
        }
        break;
      }
      const removed = edit.to - edit.from;

      shift +=
        (edit.modifications ? removed : (edit.insert?.length ?? 0)) - removed;
    }

    return position + shift;
  };

  return { change: RootChange.fromSections(sections, data), outputOf, starts };
};

const readStep = (change: RootChange) => {
  let input = 0;
  let piece: {
    at: number;
    dropped: number;
    modifications: readonly PropertyModification[] | null;
    written: PreparedTokenSlice[];
  } | null = null;
  let closed = false;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];

    if (inserted === -1) {
      if (piece) closed = true;
      input += length;
      continue;
    }

    countCoreWork('crossingPieces');

    if (closed || piece?.modifications) {
      fail('the step holds more than one piece');
    }
    if (inserted === -2) {
      if (piece) fail('the step holds more than one piece');
      piece = {
        at: input,
        dropped: 0,
        modifications: change.data[
          index >> 1
        ] as readonly PropertyModification[],
        written: [],
      };
    } else {
      piece ??= { at: input, dropped: 0, modifications: null, written: [] };
      piece.dropped += length;
      piece.written.push(change.data[index >> 1] as PreparedTokenSlice);
    }
    input += length;
  }

  return piece ?? fail('the step holds no piece');
};

const asChange = (
  root: string,
  change: RootChange,
  facts: ChangeFacts
): FactedChange => ({
  change: createInternalDocumentChange(new Map([[root, change]])),
  facts,
});

/**
 * Follows a stored undo step across a change history skipped, for a pair
 * phase 1's rule admits. Both changes apply to `document`. The crossing reads
 * positions, facts and token kinds and never compares two values: a step's
 * edit follows the token it was bound to, at one gap the skipped change's
 * letters come first, and a join moves the joined line's children to the end
 * of the line it joins, wherever the skipped change put either. A pair it
 * cannot place is a bug, so it throws.
 *
 * @internal
 */
export const crossRecord = (
  document: JsonEditorValue,
  step: FactedChange,
  skipped: FactedChange
): Crossing => {
  const stepRoot = writtenRoot(step.change);
  const skippedRoot = writtenRoot(skipped.change);

  if (!stepRoot) return fail('the step writes nothing');
  if (!skippedRoot || skippedRoot.root !== stepRoot.root) {
    return { followed: step, leftover: skipped };
  }

  const { root } = stepRoot;
  const base = valueRootIndex(document, root);
  const stepChange = stepRoot.change;
  const skippedChange = skippedRoot.change;

  if (
    base.length !== stepChange.length ||
    base.length !== skippedChange.length
  ) {
    fail('a change does not fit the document');
  }

  const stepFacts = rootFactsOf(step.facts, root);
  const skippedFacts = rootFactsOf(skipped.facts, root);

  countCoreWork(
    'crossingPieces',
    stepFacts.heirs.length +
      stepFacts.merges.length +
      skippedFacts.carries.length
  );

  const piece = readStep(stepChange);
  const k = readSkipped(base, skippedChange, skippedFacts);
  const written = PreparedTokenSlice.concat(piece.written);
  const join = piece.dropped > 0 && stepFacts.merges.length > 0;
  const levels = piece.dropped / 2;
  const joinedClose = join
    ? (base.nodeStartingAt(piece.at + levels)?.to ??
        fail('a join drops no open of the line it joins')) - 1
    : -1;

  const followed = followStep({
    joinedClose,
    k,
    levels,
    piece,
    skippedChange,
    stepFacts,
    written,
  });
  const leftover = leaveSkipped({
    base,
    join,
    joinedClose,
    k,
    piece,
    written,
  });

  return {
    followed: asChange(
      root,
      followed.change,
      recordedFacts([[root, followed.facts]])
    ),
    leftover: leftover
      ? asChange(
          root,
          leftover.change,
          recordedFacts([
            [root, { carries: leftover.carries, heirs: [], merges: [] }],
          ])
        )
      : { change: DocumentChange.empty, facts: NO_FACTS },
  };
};

type Skipped = ReturnType<typeof readSkipped>;
type Step = ReturnType<typeof readStep>;

const followStep = ({
  joinedClose,
  k,
  levels,
  piece,
  skippedChange,
  stepFacts,
  written,
}: Readonly<{
  joinedClose: number;
  k: Skipped;
  levels: number;
  piece: Step;
  skippedChange: RootChange;
  stepFacts: RootFacts;
  written: PreparedTokenSlice;
}>) => {
  const length = skippedChange.newLength;
  const carries: Carry[] = [];
  const heirs: Heir[] = [];
  const merges: Merge[] = [];

  if (piece.modifications) {
    const at = k.outputOf(piece.at);
    const { change } = changeFrom(length, [
      { from: at, modifications: piece.modifications, to: at + 1 },
    ]);

    return { change, facts: { carries, heirs, merges } };
  }
  if (written.length > 0) {
    if (piece.at === 0) fail('the step writes before every token');

    const at = k.pastFresh(k.outputOf(piece.at - 1) + 1);
    const { change } = changeFrom(length, [
      { from: at, insert: written, to: at },
    ]);

    for (const [heir, of] of stepFacts.heirs) {
      heirs.push([at + heir - piece.at, k.outputOf(of)]);
    }

    return { change, facts: { carries, heirs, merges } };
  }
  if (stepFacts.merges.length === 0) {
    const edits = k.outputRuns(piece.at, piece.at + piece.dropped);

    return {
      change: changeFrom(length, edits).change,
      facts: { carries, heirs, merges },
    };
  }

  const closes = k.outputOf(piece.at);
  const lineClose = k.outputOf(piece.at + levels - 1);
  const lineOpen = k.outputOf(piece.at + levels);

  for (let level = 0; level < levels; level++) {
    if (
      k.outputOf(piece.at + level) !== closes + level ||
      k.outputOf(piece.at + levels + level) !== lineOpen + level
    ) {
      fail('the leaves a join merges are apart');
    }
  }

  const adjacent = lineOpen === lineClose + 1;
  const contentEnd = k.outputOf(joinedClose);
  const moved = contentEnd - lineOpen - levels;
  const edits: Edit[] = adjacent
    ? [{ from: closes, to: closes + 2 * levels }]
    : moved === 0
      ? [{ from: lineOpen, to: contentEnd + 1 }]
      : [
          {
            from: closes,
            // The joined line's children follow the joining line's last
            // children, so its own inner closes go.
            insert: k.outputSlice(lineOpen + levels, contentEnd),
            to: lineClose,
          },
          { from: lineOpen, to: contentEnd + 1 },
        ].sort((left, right) => left.from - right.from);
  const built = changeFrom(length, edits);

  if (!adjacent && moved > 0) {
    const copy = built.starts[edits.findIndex((edit) => edit.insert)];

    carries.push([copy, lineOpen + levels, moved]);
  }
  for (const [at, into] of stepFacts.merges) {
    merges.push([k.outputOf(at), built.outputOf(k.outputOf(into))]);
  }

  return { change: built.change, facts: { carries, heirs, merges } };
};

const insertsBeforeDrops = (left: Edit, right: Edit) =>
  left.from - right.from ||
  Number(left.from !== left.to) - Number(right.from !== right.to);

const leaveSkipped = ({
  base,
  join,
  joinedClose,
  k,
  piece,
  written,
}: Readonly<{
  base: DocumentIndex;
  join: boolean;
  joinedClose: number;
  k: Skipped;
  piece: Step;
  written: PreparedTokenSlice;
}>) => {
  const from = piece.at;
  const to = piece.at + (piece.modifications ? 0 : piece.dropped);
  const shift = (piece.modifications ? 0 : written.length) - (to - from);
  const positionOf = (position: number) =>
    position < from ? position : position >= to ? position + shift : null;
  const gapOf = (gap: number) =>
    gap <= from ? gap : gap >= to ? gap + shift : from;
  const afterJoined = () =>
    (positionOf(joinedClose) ??
      fail("the step drops the joined line's close")) + 1;
  const pieceTokens = piece.modifications
    ? applyPropertyModificationsToSlice(
        base.slice(from, from + 1),
        piece.modifications
      )
    : written;
  const pieceEnd = from + pieceTokens.length;
  const sourceEnd = piece.modifications ? from + 1 : to;
  const stepSlice = (a: number, b: number) => {
    const parts: PreparedTokenSlice[] = [];

    if (a < from) parts.push(base.slice(a, Math.min(b, from)));
    if (b > from && a < pieceEnd) {
      parts.push(
        pieceTokens.slice(
          Math.max(a, from) - from,
          Math.min(b, pieceEnd) - from
        )
      );
    }
    if (b > pieceEnd) {
      parts.push(
        base.slice(
          Math.max(a, pieceEnd) - pieceEnd + sourceEnd,
          b - pieceEnd + sourceEnd
        )
      );
    }

    return PreparedTokenSlice.concat(parts);
  };

  // Where the moved run starts and ends after the step. A join that takes
  // its first line out leaves the rest to move, and a join into its last line
  // moves the line it joined too.
  let start = -1;
  let end = -1;
  let target = -1;

  if (k.drop) {
    start = positionOf(k.drop.from) ?? afterJoined();
    end = (positionOf(k.drop.to - 1) ?? afterJoined() - 1) + 1;
    // A block moved between the two lines lands after the line they make.
    target =
      join && from < k.copyGap && k.copyGap < to
        ? afterJoined()
        : gapOf(k.copyGap);
    if (target > start && target < end) {
      fail('the moved run lands inside itself');
    }
  }

  const moves = start < end && target !== start && target !== end;
  const { drop } = k;
  const inside: Fresh[] = [];
  const outside: Fresh[] = [];

  for (const each of k.fresh) {
    (drop && drop.from < each.baseGap && each.baseGap < drop.to
      ? inside
      : outside
    ).push(each);
  }
  const letters: Array<Readonly<{ at: number; slice: PreparedTokenSlice }>> =
    [];
  const copyLetters: Array<
    Readonly<{ at: number; slice: PreparedTokenSlice }>
  > = [];
  let outsideAt = 0;
  let insideAt = 0;

  // Both lists are in base gap order, and the gaps inside the moved run lie
  // between those outside it, so one merge keeps the skipped change's order.
  while (outsideAt < outside.length || insideAt < inside.length) {
    countCoreWork('crossingPieces');

    const fromInside =
      insideAt < inside.length &&
      (outsideAt >= outside.length ||
        inside[insideAt].baseGap < outside[outsideAt].baseGap);
    const each = fromInside ? inside[insideAt] : outside[outsideAt];

    if (fromInside) insideAt += 1;
    else outsideAt += 1;
    const at = gapOf(each.baseGap);
    const slice = each.slice.slice(each.offset, each.offset + each.length);

    (moves && at > start && at < end ? copyLetters : letters).push({
      at,
      slice,
    });
  }

  const edits: Edit[] = letters.map(({ at, slice }) => ({
    from: at,
    insert: slice,
    to: at,
  }));
  const carries: Carry[] = [];
  let copyEdit: Edit | null = null;
  const parts: Array<readonly [from: number, to: number]> = [];

  if (moves) {
    const slices: PreparedTokenSlice[] = [];
    let at = start;

    for (const letter of [
      ...copyLetters,
      { at: end, slice: PreparedTokenSlice.empty },
    ]) {
      slices.push(stepSlice(at, letter.at), letter.slice);
      parts.push([at, letter.at]);
      ({ at } = letter);
    }
    copyEdit = {
      from: target,
      insert: PreparedTokenSlice.concat(slices),
      to: target,
    };
    edits.push({ from: start, to: end }, copyEdit);
  }
  if (edits.length === 0) return null;

  edits.sort(insertsBeforeDrops);

  const built = changeFrom(base.length + shift, edits);

  if (copyEdit) {
    let output = built.starts[edits.indexOf(copyEdit)];

    parts.forEach(([partFrom, partTo], index) => {
      if (partTo > partFrom) {
        carries.push([output, partFrom, partTo - partFrom]);
      }
      output += partTo - partFrom + (copyLetters[index]?.slice.length ?? 0);
    });
  }

  return { carries, change: built.change };
};
