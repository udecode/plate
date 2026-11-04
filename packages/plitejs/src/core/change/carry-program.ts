import { countCoreWork } from '../work';
import {
  addMatched,
  type CarriedProjectionSchema,
  closesOf,
  Correspondence,
  lineAt,
  type Match,
  opensOf,
  pieceOpensOf,
  propsOf,
  sameToken,
  Tokens,
} from './carried-projection';
import type { CarriedRun } from './carried-run';
import type { DocumentIndex, IndexedNodeRange } from './document-index';
import { jsonEqual } from './json';
import {
  addSection,
  applyPropertyModifications,
  RootChange,
  type SectionData,
} from './root-change';
import {
  closeToken,
  type JsonToken,
  type OpenToken,
  openToken,
  PreparedTokenSlice,
} from './tokens';
import type { PropertyModification } from './transform';

export type SeparateProgram = Readonly<{
  kind: 'separate';
  root: string;
  /** The gap where the step cuts the merged line. */
  cut: number;
  /** The merged line's close, which closes the restored line. */
  end: number;
  /** What the step writes after the cut to finish the first line, balanced. */
  head: readonly JsonToken[];
  /**
   * The opens of the elements the step restores around the second line, the
   * line's open, and its letters before the carried ones, closed.
   */
  opens: readonly JsonToken[];
  /** How many restored elements close after the line. */
  closes: number;
  /** Ancestors of the merged line that the restored line is not inside. */
  exits: readonly number[];
  /** The element the restored line goes in, or null for the root. */
  parent: number | null;
  /** The child of `parent` it follows, or null for its first child. */
  previous: number | null;
}>;

export type JoinProgram = Readonly<{
  kind: 'join';
  root: string;
  /** The gap in the first line where the carried letters land. */
  cut: number;
  /** The gap in the second line where the carried letters start. */
  start: number;
  /** The second line's close, which closes the joined line. */
  end: number;
  /** The first line's close, which the step deletes. */
  close: number;
  /** The second line's open, which the step deletes. */
  open: number;
  /** The other tokens the step deletes, ascending. */
  removed: readonly number[];
  /** Opens of elements the step deletes around the second line once empty. */
  ancestors: readonly number[];
}>;

/**
 * A step whose one run separates a merged line into the two lines it joined,
 * or joins them again, kept as what it does instead of the tokens it wrote.
 * Every position is a token or a gap of the step's base document in `root`;
 * an outside edit maps them, and the step is compiled again from them.
 */
export type CarryProgram = JoinProgram | SeparateProgram;

type InputPosition = number;

type MadeKey = string;

type Origin = InputPosition | MadeKey | null;

export type CompiledCarry = Readonly<{
  step: RootChange;
  inputFrom: number;
  inputTo: number;
  tokens: readonly JsonToken[];
  origins: readonly Origin[];
  carriedAt: number;
  closeAt: number;
}>;

const isLetter = (token: JsonToken | undefined) => token?.kind === 'text';

const isElementOpen = (token: JsonToken | undefined) =>
  token?.kind === 'open' && token.nodeKind === 'element';

const isLeafClose = (token: JsonToken | undefined) =>
  token?.kind === 'close' && token.nodeKind === 'text';

const tokensOf = (document: DocumentIndex, from: number, to: number) => {
  const read = new Tokens(document, from, to);
  const tokens: JsonToken[] = [];

  for (let position = from; position < to; position++) {
    tokens.push(read.at(position) as JsonToken);
  }

  return tokens;
};

const tokenAt = (document: DocumentIndex, position: number) =>
  document.slice(position, position + 1).tokens[0];

const depthOf = (tokens: readonly JsonToken[]) => {
  let depth = 0;

  for (const token of tokens) {
    if (token.kind === 'open') depth += 1;
    if (token.kind === 'close') depth -= 1;
    if (depth < 0) return null;
  }

  return depth;
};

const rangeAt = (document: DocumentIndex, open: number) => {
  const range = document.nodeStartingAt(open);

  return range?.from === open ? range : null;
};

const contains = (outer: IndexedNodeRange, inner: IndexedNodeRange) =>
  outer.from < inner.from && inner.to <= outer.to;

const only = (
  document: DocumentIndex,
  kind: 'close' | 'open',
  from: number,
  to: number
) => from >= to || tokensOf(document, from, to).every((t) => t.kind === kind);

export const recordCarryProgram = ({
  after,
  before,
  run,
  schema,
  step,
}: Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  run: CarriedRun;
  schema: CarriedProjectionSchema;
  step: RootChange;
}>): CarryProgram | null => {
  const source = lineAt(before, schema, run.source);
  const landing = lineAt(after, schema, run.at);

  if (!source || !landing) return null;
  if (run.source + run.length !== source.line.to) return null;

  const map = new Correspondence(step, before, { keepReinserted: true });
  const sourceOpen = map.target(source.line.from);
  const landingOpen = map.source(landing.line.from);

  if (sourceOpen !== null && landingOpen === null) {
    if (run.at + run.landed !== landing.line.to) return null;

    const kept = map.target(run.source - 1);
    const first = kept === null ? null : lineAt(after, schema, kept + 1);

    if (kept === null || first?.line.from !== sourceOpen) return null;

    const head = [
      ...opensOf(after, first.within),
      ...tokensOf(after, kept + 1, first.line.to - 1),
    ];
    const restored = landing.ancestors.filter(
      (entry) => map.source(entry.from) === null
    );
    const keptAncestors = landing.ancestors.slice(
      0,
      landing.ancestors.length - restored.length
    );

    if (
      depthOf(head) !== 0 ||
      keptAncestors.some((entry) => map.source(entry.from) === null)
    ) {
      return null;
    }

    const outer = restored[0] ?? landing.line;
    const index = outer.path.at(-1) ?? 0;
    const previous =
      index > 0
        ? map.source(
            after.nodeRange([...outer.path.slice(0, -1), index - 1]).from
          )
        : null;
    const parentEntry = keptAncestors.at(-1);
    const parent = parentEntry ? map.source(parentEntry.from) : null;
    const exits: number[] = [];

    for (const entry of source.ancestors) {
      const target = map.target(entry.from);

      if (target === null) return null;
      if (!landing.ancestors.some((each) => each.from === target)) {
        exits.push(entry.from);
      }
    }
    if ((index > 0 && previous === null) || (parentEntry && parent === null)) {
      return null;
    }

    return {
      closes: restored.length,
      cut: run.source,
      end: source.line.to - 1,
      exits,
      head,
      kind: 'separate',
      opens: [
        ...opensOf(after, restored),
        ...tokensOf(after, landing.line.from, run.at),
        ...closesOf(landing.within),
      ],
      parent,
      previous,
      root: run.root,
    };
  }
  if (sourceOpen !== null || landingOpen === null) return null;

  const first = rangeAt(before, landingOpen);
  const kept = map.source(run.at - 1);

  if (!first || kept === null || kept + 1 >= first.to) return null;

  const cut = kept + 1;
  const close = first.to - 1;
  const open = source.line.from;
  const read = new Tokens(before, cut, run.source);
  const removed: number[] = [];
  const ancestors: number[] = [];

  for (let position = cut; position < run.source; position++) {
    if (map.target(position) !== null) continue;
    if (position === close || position === open) continue;
    removed.push(position);
    if (
      position > close &&
      position < open &&
      read.at(position)?.kind === 'open'
    ) {
      ancestors.push(position);
    }
  }
  if (map.target(close) !== null || map.target(open) !== null) return null;

  return {
    ancestors,
    close,
    cut,
    end: source.line.to - 1,
    kind: 'join',
    open,
    removed,
    root: run.root,
    start: run.source,
  };
};

const gapWithFirstReplacedLetter = (
  map: Correspondence,
  before: DocumentIndex,
  gap: number
) => {
  const section = map.sections.find(
    (each) =>
      each.inserted >= 0 && each.from < gap && gap < each.from + each.length
  );

  if (!section) return null;
  if (tokensOf(before, section.from, gap).some(isLetter)) {
    return section.at + section.inserted;
  }
  if (tokensOf(before, gap, section.from + section.length).some(isLetter)) {
    return section.at;
  }

  return null;
};

const gapThrough = (
  map: Correspondence,
  change: RootChange,
  before: DocumentIndex,
  gap: number,
  assoc: -1 | 1
) => {
  const after = map.target(gap);
  const previous = gap > 0 ? map.target(gap - 1) : null;

  if (after === null && previous === null) {
    return (
      gapWithFirstReplacedLetter(map, before, gap) ?? change.mapPos(gap, assoc)
    );
  }
  if (assoc > 0) return after ?? (previous === null ? null : previous + 1);

  return previous === null ? after : previous + 1;
};

const lineCloseThrough = (
  map: Correspondence,
  close: number,
  edited: DocumentIndex,
  schema: CarriedProjectionSchema
) => {
  const lastLeaf = map.target(close - 1);
  const line = lastLeaf === null ? null : lineAt(edited, schema, lastLeaf);

  return line ? line.line.to - 1 : map.target(close);
};

const mapThrough = (
  program: CarryProgram,
  change: RootChange,
  before: DocumentIndex,
  edited: DocumentIndex,
  schema: CarriedProjectionSchema
): CarryProgram | null => {
  const map = new Correspondence(change, before, { keepReinserted: true });
  const token = (position: number) => map.target(position);
  const tokens = (positions: readonly number[]) =>
    positions.flatMap((position) => {
      const target = map.target(position);

      return target === null ? [] : [target];
    });
  const end = lineCloseThrough(map, program.end, edited, schema);

  if (end === null) return null;
  if (program.kind === 'separate') {
    const cutAssoc = tokensOf(before, program.cut, program.end).some(isLetter)
      ? 1
      : -1;
    const cut = gapThrough(map, change, before, program.cut, cutAssoc);
    const parent = program.parent === null ? null : token(program.parent);
    const previous = program.previous === null ? null : token(program.previous);

    if (
      cut === null ||
      (program.parent !== null && parent === null) ||
      (program.previous !== null && previous === null)
    ) {
      return null;
    }

    return {
      ...program,
      cut,
      end,
      exits: tokens(program.exits),
      parent,
      previous,
    };
  }

  const cut = gapThrough(map, change, before, program.cut, 1);
  const start = gapThrough(map, change, before, program.start, 1);
  const close = token(program.close);
  const open = token(program.open);

  if (cut === null || start === null || close === null || open === null) {
    return null;
  }

  return {
    ...program,
    ancestors: tokens(program.ancestors),
    close,
    cut,
    end,
    open,
    removed: tokens(program.removed),
    start,
  };
};

export const mapCarryProgram = (
  program: CarryProgram,
  edit: RootChange,
  before: DocumentIndex,
  edited: DocumentIndex,
  schema: CarriedProjectionSchema
): CarryProgram | null => {
  const mapped = mapThrough(program, edit, before, edited, schema);

  if (mapped) return mapped;

  const byKeptLetters = RootChange.aligned(before, edited);

  return (
    byKeptLetters && mapThrough(program, byKeptLetters, before, edited, schema)
  );
};

type Piece = Readonly<{ token: JsonToken; origin: Origin; kept: boolean }>;

const made = (tokens: readonly JsonToken[], key?: string): Piece[] =>
  tokens.map((token, index) => ({
    kept: false,
    origin: key === undefined ? null : `${key}${index}`,
    token,
  }));

const copied = (
  document: DocumentIndex,
  from: number,
  to: number,
  kept: boolean
): Piece[] =>
  tokensOf(document, from, to).map((token, index) => ({
    kept,
    origin: from + index,
    token,
  }));

const joinLeaves = (
  pieces: readonly Piece[],
  context: readonly OpenToken[]
) => {
  const stack: OpenToken[] = [...context];
  const out: Piece[] = [];
  let closed: OpenToken | undefined;

  for (const piece of pieces) {
    const { token } = piece;
    const last = out.at(-1);

    if (
      token.kind === 'open' &&
      token.nodeKind === 'text' &&
      closed &&
      isLeafClose(last?.token) &&
      typeof last?.origin !== 'number' &&
      jsonEqual(closed.props, token.props)
    ) {
      out.pop();
      stack.push(closed);
      closed = undefined;
      continue;
    }
    closed = undefined;
    if (token.kind === 'open') stack.push(token);
    else if (token.kind === 'close') closed = stack.pop();
    out.push(piece);
  }

  return out;
};

const pushMatch = (matches: Match[], match: Match) => {
  const last = matches.at(-1);

  if (
    last &&
    !last.modifications &&
    !match.modifications &&
    last.source + last.length === match.source &&
    last.target + last.length === match.target
  ) {
    matches[matches.length - 1] = {
      ...last,
      length: last.length + match.length,
    };
  } else matches.push(match);
};

const contextAt = (document: DocumentIndex, position: number) =>
  document
    .openContextAt(position)
    .filter((entry) => entry.from < position && position < entry.to)
    .map((entry) => opensOf(document, [entry])[0]);

const compiled = (
  document: DocumentIndex,
  from: number,
  to: number,
  pieces: readonly Piece[],
  carriedFrom: number,
  end: number
): CompiledCarry | null => {
  const joined = joinLeaves(pieces, contextAt(document, from));
  const matches: Match[] = [];
  let carriedAt = -1;
  let closeAt = -1;

  joined.forEach((piece, index) => {
    if (piece.origin === carriedFrom && carriedAt < 0) {
      carriedAt = from + index;
    }
    if (piece.origin === end) closeAt = from + index;
    if (!piece.kept || typeof piece.origin !== 'number') return;

    pushMatch(matches, {
      length: 1,
      source: piece.origin - from,
      target: index,
    });
  });
  if (closeAt < 0) return null;

  const tokens = joined.map((piece) => piece.token);
  const sections: number[] = [];
  const data: SectionData[] = [];

  addSection(sections, data, from, -1, null);
  addMatched(
    sections,
    data,
    to - from,
    PreparedTokenSlice.fromTokens(tokens),
    matches
  );
  addSection(sections, data, document.length - to, -1, null);
  countCoreWork('carriedTokens', tokens.length);

  return {
    carriedAt: carriedAt < 0 ? closeAt : carriedAt,
    closeAt,
    inputFrom: from,
    inputTo: to,
    origins: joined.map((piece) => piece.origin),
    step: RootChange.fromSections(sections, data),
    tokens,
  };
};

const compileSeparate = (
  program: SeparateProgram,
  document: DocumentIndex,
  schema: CarriedProjectionSchema
) => {
  const { cut, end } = program;
  const line = lineAt(document, schema, cut);

  if (!line || end < cut || end >= document.length) return null;

  const floor = -(line.within.length + 1);
  let depth = 0;

  for (const token of tokensOf(document, cut, end + 1)) {
    if (token.kind === 'open') depth += 1;
    if (token.kind === 'close') depth -= 1;
    if (depth < floor) return null;
  }

  let reach = end + 1;

  while (depth > floor) {
    if (
      reach >= document.length ||
      tokenAt(document, reach)?.kind !== 'close'
    ) {
      return null;
    }
    depth -= 1;
    reach += 1;
  }
  if (depth !== floor) return null;

  const holdsOnlyTheLine = (entry: IndexedNodeRange) =>
    only(document, 'open', entry.from + 1, line.line.from) &&
    only(document, 'close', reach, entry.to - 1);
  const chain = [...line.ancestors, line.line];
  const exits = new Set(program.exits);
  const below =
    program.parent === null
      ? 0
      : chain.findIndex((entry) => entry.from === program.parent) + 1;
  let place: number;

  if (below > 0 || program.parent === null) {
    let at = below;

    while (
      at < chain.length - 1 &&
      !exits.has(chain[at].from) &&
      !holdsOnlyTheLine(chain[at])
    ) {
      at += 1;
    }
    place = Math.max(reach, chain[at].to);
  } else {
    const anchor =
      program.previous === null
        ? rangeAt(document, program.parent)
        : rangeAt(document, program.previous);

    if (!anchor) return null;
    place = program.previous === null ? anchor.contentFrom : anchor.to;
    if (place < reach) return null;
  }

  return compiled(
    document,
    cut,
    place,
    [
      ...made(closesOf(line.within)),
      ...made(program.head, 'h'),
      ...made([closeToken('element')], 'line'),
      ...copied(document, reach, place, true),
      ...made(program.opens, 'o'),
      ...made(
        pieceOpensOf(
          { edited: document, root: program.root, schema },
          line.within,
          program.opens
            .flatMap((token) =>
              token.kind === 'open' && token.nodeKind === 'element'
                ? [{ ...token.props, children: [] }]
                : []
            )
            .toReversed()
        )
      ),
      ...copied(document, cut, reach, false),
      ...made(
        Array.from({ length: program.closes }, () => closeToken('element')),
        'c'
      ),
    ],
    cut,
    end
  );
};

const emptiesTeammateElement = (
  document: DocumentIndex,
  program: JoinProgram,
  element: IndexedNodeRange | undefined,
  firstLine: IndexedNodeRange
) =>
  !!element &&
  !program.ancestors.includes(element.from) &&
  !contains(element, firstLine) &&
  only(document, 'open', element.from + 1, program.open) &&
  only(document, 'close', program.end + 1, element.to - 1);

const dropEmptiedAncestors = (
  pieces: Piece[],
  ancestors: ReadonlySet<number>
) => {
  for (let index = 0; index < pieces.length - 1;) {
    const piece = pieces[index];

    if (
      typeof piece.origin === 'number' &&
      ancestors.has(piece.origin) &&
      pieces[index + 1].token.kind === 'close'
    ) {
      pieces.splice(index, 2);
      index = Math.max(0, index - 1);
    } else index += 1;
  }

  return pieces;
};

const compileJoin = (
  program: JoinProgram,
  document: DocumentIndex,
  schema: CarriedProjectionSchema
) => {
  const { close, cut, end, open, start } = program;

  if (!(cut <= close && close < open && open <= start && start <= end)) {
    return null;
  }

  const first = lineAt(document, schema, cut);
  const second = lineAt(document, schema, start);

  if (
    !first ||
    !second ||
    first.line.to - 1 !== close ||
    second.line.from !== open ||
    second.line.to - 1 !== end
  ) {
    return null;
  }

  if (
    emptiesTeammateElement(
      document,
      program,
      second.ancestors.at(-1),
      first.line
    )
  ) {
    return null;
  }

  const removed = new Set(program.removed);

  let to = end + 1;

  while (to < document.length && tokenAt(document, to)?.kind === 'close') {
    to += 1;
  }

  const survivors: Piece[] = [];
  const read = new Tokens(document, cut, start);
  let leaf: OpenToken | undefined = first.within
    .filter((entry) => entry.kind === 'text')
    .map((entry) => opensOf(document, [entry])[0])
    .at(-1);

  for (const [low, high] of [
    [cut, close],
    [open + 1, start],
  ]) {
    for (let position = low; position < high; position++) {
      const token = read.at(position) as JsonToken;

      if (token.kind === 'text') {
        if (removed.has(position) || !leaf) continue;
        survivors.push(
          ...made([leaf]),
          { kept: false, origin: position, token },
          ...made([closeToken('text')])
        );
      } else if (token.kind === 'open' && token.nodeKind === 'text') {
        leaf = token;
      } else if (token.kind === 'close' && token.nodeKind === 'text') {
        leaf = undefined;
      } else if (!removed.has(position)) return null;
    }
  }

  const pieces = [
    ...made(closesOf(first.within)),
    ...survivors,
    ...made(
      pieceOpensOf(
        { edited: document, root: program.root, schema },
        second.within,
        [...first.ancestors, first.line]
          .map((entry) => ({ ...propsOf(document, entry), children: [] }))
          .toReversed()
      )
    ),
    ...copied(document, start, end + 1, false),
    ...copied(document, close + 1, open, true),
    ...copied(document, end + 1, to, true),
  ];

  return compiled(
    document,
    cut,
    to,
    dropEmptiedAncestors(pieces, new Set(program.ancestors)),
    start,
    end
  );
};

export const compileCarryProgram = (
  program: CarryProgram,
  document: DocumentIndex,
  schema: CarriedProjectionSchema
): CompiledCarry | null =>
  program.kind === 'separate'
    ? compileSeparate(program, document, schema)
    : compileJoin(program, document, schema);

const originOf = (carry: CompiledCarry, position: number): Origin => {
  if (position < carry.inputFrom) return position;

  const offset = position - carry.inputFrom;

  return offset < carry.origins.length
    ? carry.origins[offset]
    : position - carry.origins.length + carry.inputTo - carry.inputFrom;
};

export const repairKeepsCarry = (
  carry: CompiledCarry,
  output: DocumentIndex,
  repair: RootChange
) => {
  let position = 0;

  for (let index = 0; index < repair.sections.length; index += 2) {
    const length = repair.sections[index];
    const inserted = repair.sections[index + 1];

    if (inserted >= 0 && length > 0) {
      const read = new Tokens(output, position, position + length);

      for (let at = position; at < position + length; at++) {
        const token = read.at(at);

        if (
          (isLetter(token) || isElementOpen(token)) &&
          originOf(carry, at) !== null
        ) {
          return false;
        }
      }
    }
    position += length;
  }

  return true;
};

export type CarryFinal = Readonly<{
  carry: CompiledCarry;
  output: DocumentIndex;
  repair: RootChange;
  after: DocumentIndex;
}>;

const finalOrigins = ({ carry, output, repair }: CarryFinal) => {
  const map = new Correspondence(repair, output, { keepReinserted: true });

  return (position: number): Origin => {
    const source = map.source(position);

    return source === null ? null : originOf(carry, source);
  };
};

const keptEnds = ({ sections }: RootChange) => {
  let head = 0;
  let first = 0;

  while (first < sections.length && sections[first + 1] === -1) {
    head += sections[first];
    first += 2;
  }

  const keepsEverything = first >= sections.length;

  if (keepsEverything) {
    const length = head;

    return { head: length, tail: length };
  }

  let tail = 0;

  for (
    let last = sections.length - 2;
    last >= first && sections[last + 1] === -1;
    last -= 2
  ) {
    tail += sections[last];
  }

  return { head, tail };
};

export const sameResultsOfOneInput = (
  left: DocumentIndex,
  right: DocumentIndex,
  changes: readonly RootChange[]
) => {
  if (left.length !== right.length) return false;

  const ends = changes.map(keptEnds);
  const from = Math.min(...ends.map((end) => end.head));
  const to = left.length - Math.min(...ends.map((end) => end.tail));

  return (
    from >= to ||
    jsonEqual(left.slice(from, to).tokens, right.slice(from, to).tokens)
  );
};

const windowOf = ({ after, carry, output, repair }: CarryFinal) => {
  const kept = keptEnds(repair);
  const head = Math.min(carry.inputFrom, kept.head);
  const tail = Math.min(
    output.length - carry.inputFrom - carry.origins.length,
    kept.tail
  );

  return {
    from: head,
    tail,
    tailShift:
      after.length -
      (output.length - carry.origins.length + carry.inputTo - carry.inputFrom),
    to: after.length - tail,
  };
};

type Window = ReturnType<typeof windowOf>;

const keptAt = (window: Window, inputLength: number, position: number) =>
  position < window.from
    ? position
    : position >= inputLength - window.tail
      ? position + window.tailShift
      : null;

const matchKeptOutsideWindows = (
  editMap: Correspondence,
  old: Window,
  fresh: Window,
  baseLength: number,
  editedLength: number
) => {
  const matches: Match[] = [];
  const kept = editMap.sections
    .filter((section) => section.inserted < 0)
    .map(({ at, data, from, inserted, length }) => ({
      at,
      from,
      length,
      modifications:
        inserted === -2 ? (data as readonly PropertyModification[]) : null,
    }));

  if (editMap.move) {
    kept.push({
      at: editMap.move.insertion.at,
      from: editMap.move.deletion.from,
      length: editMap.move.deletion.length,
      modifications: null,
    });
  }

  const oldRegions = [
    [0, old.from],
    [baseLength - old.tail, baseLength],
  ];
  const freshRegions = [
    [0, fresh.from],
    [editedLength - fresh.tail, editedLength],
  ];

  for (const section of kept) {
    for (const [oldFrom, oldTo] of oldRegions) {
      for (const [freshFrom, freshTo] of freshRegions) {
        const shift = section.at - section.from;
        const from = Math.max(section.from, oldFrom, freshFrom - shift);
        const to = Math.min(
          section.from + section.length,
          oldTo,
          freshTo - shift
        );

        if (from < to) {
          const source = keptAt(old, baseLength, from) as number;
          const target = keptAt(fresh, editedLength, from + shift) as number;

          matches.push(
            section.modifications
              ? {
                  length: 1,
                  modifications: section.modifications,
                  source,
                  target,
                }
              : { length: to - from, source, target }
          );
        }
      }
    }
  }

  return matches;
};

export const carryRest = (
  previous: CarryFinal,
  edit: RootChange,
  editBefore: DocumentIndex,
  next: CarryFinal
) => {
  const editMap = new Correspondence(edit, editBefore, {
    keepReinserted: true,
  });
  const old = windowOf(previous);
  const fresh = windowOf(next);
  const baseLength = editBefore.length;
  const editedLength = edit.newLength;
  const matches = matchKeptOutsideWindows(
    editMap,
    old,
    fresh,
    baseLength,
    editedLength
  );
  /**
   * Keeps source token `source` as target token `target`, or modifies it
   * there when the edit modified the properties of its input token `input`.
   */
  const match = (source: number, target: number, input: number | null) => {
    const kept = tokenAt(previous.after, source);
    const written = tokenAt(next.after, target);

    if (sameToken(kept, written)) {
      matches.push({ length: 1, source, target });
      return;
    }

    const modifications =
      input === null ? null : editMap.modificationsAt(input);

    if (
      modifications &&
      kept?.kind === 'open' &&
      sameToken(
        openToken(
          kept.nodeKind,
          applyPropertyModifications(kept.props, modifications)
        ),
        written
      )
    ) {
      matches.push({ length: 1, modifications, source, target });
    }
  };

  const oldOrigin = finalOrigins(previous);
  const newOrigin = finalOrigins(next);
  const byPosition = new Map<number, number>();
  const byKey = new Map<string, number>();

  for (let position = old.from; position < old.to; position++) {
    const origin = oldOrigin(position);

    if (typeof origin === 'string') {
      byKey.set(origin, position);
      continue;
    }
    if (origin === null) continue;

    const target = editMap.target(origin);

    if (target === null) continue;
    byPosition.set(target, position);

    const outside = keptAt(fresh, editedLength, target);

    if (outside !== null) match(position, outside, origin);
  }

  for (let position = fresh.from; position < fresh.to; position++) {
    const origin = newOrigin(position);
    let source: number | null | undefined;
    let input: number | null = null;

    if (typeof origin === 'string') source = byKey.get(origin);
    else if (origin !== null) {
      input = editMap.source(origin);
      source = byPosition.get(origin);

      if (source === undefined) {
        source = input === null ? null : keptAt(old, baseLength, input);
      }
    }
    if (typeof source === 'number') match(source, position, input);
  }

  matches.sort((left, right) => left.target - right.target);

  const joined: Match[] = [];

  for (const each of matches) pushMatch(joined, each);

  const sections: number[] = [];
  const data: SectionData[] = [];

  addMatched(sections, data, previous.after.length, next.after, joined);

  return RootChange.fromSections(sections, data);
};

export const carriedRunOf = (
  { after, carry, output, repair }: CarryFinal,
  root: string
): CarriedRun | null => {
  const map = new Correspondence(repair, output, { keepReinserted: true });
  const at = map.target(carry.carriedAt);
  const closing = map.target(carry.closeAt);
  const source = originOf(carry, carry.carriedAt);
  const end = originOf(carry, carry.closeAt);

  if (
    at === null ||
    closing === null ||
    typeof source !== 'number' ||
    typeof end !== 'number' ||
    closing >= after.length
  ) {
    return null;
  }

  return {
    at,
    landed: closing - at + 1,
    length: end - source + 1,
    root,
    source,
  };
};
