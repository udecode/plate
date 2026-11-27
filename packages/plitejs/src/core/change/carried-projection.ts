import { countCoreWork } from '../work';
import type { CarriedRun, ExactRun } from './carried-run';
import {
  decodeNodes,
  type DocumentIndex,
  type IndexedNodeRange,
} from './document-index';
import { liftOf } from './join';
import { jsonEqual, type JsonRecord } from './json';
import {
  addSection,
  applyPropertyModifications,
  mapRootChangePositionBackward,
  RootChange,
  type SectionData,
} from './root-change';
import {
  closeToken,
  type JsonNode,
  type JsonToken,
  openToken,
  PreparedTokenSlice,
  textToken,
} from './tokens';
import type { PropertyModification } from './transform';

/**
 * A step that moves a run of tokens, mapped through an outside edit by the
 * letters the edit kept instead of by position.
 *
 * - Input: the step `step` on `before` with its runs, the document `after` it
 *   gives, and the edit `edit` from `before` to `edited`.
 * - Correspondence: each token the edit kept or moved exactly, found through
 *   its kept sections and its exact move, never by equal letters alone.
 * - Placement: content the edit inserted goes with the first letter it
 *   replaced, or else with the kept letter before it in its line, or with the
 *   one after it when the step deletes that one; content inserted where a run
 *   holds no letter goes with the run.
 * - Output: `step` mapped onto `edited`, and `rest`, the change from `after`
 *   to the same result, both written from one assembled document, with where
 *   each letter of `after` stands in it.
 */
export type CarriedProjectionInput = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  edit: RootChange;
  edited: DocumentIndex;
  root: string;
  runs: readonly ExactRun[];
  schema: CarriedProjectionSchema;
  step: RootChange;
}>;

export type CarriedProjectionSchema = Readonly<{
  isInline: (element: JsonNode) => boolean;
  isVoid: (element: JsonNode) => boolean;
  splitProps: (
    element: JsonNode,
    ancestors: readonly JsonNode[],
    root: string
  ) => JsonRecord;
}>;

/**
 * Where a letter lands, null where it lands nowhere, or undefined to leave it
 * to the ordinary pairing.
 */
export type LetterPlace = number | null | undefined;

export type CarriedProjection = Readonly<{
  letterAt: (position: number) => LetterPlace;
  /** The change from `after` to the projected document. */
  rest: RootChange;
  /** The run the mapped step carries, from `edited` to the projection. */
  runs: readonly CarriedRun[];
  /** The step mapped onto `edited`. */
  step: RootChange;
}>;

/** A projection the documents leave no place for. */
export class CarriedProjectionError extends Error {
  override name = 'CarriedProjectionError';
}

const refuse = (reason: string): never => {
  throw new CarriedProjectionError(reason);
};

type Section = Readonly<{
  /** Start in the input. */
  from: number;
  /** Length in the input. */
  length: number;
  /** Start in the output. */
  at: number;
  /** -1 keeps, -2 keeps with new properties, a count replaces. */
  inserted: number;
  data: SectionData;
}>;

const sectionsOf = (change: RootChange): Section[] => {
  const sections: Section[] = [];
  let from = 0;
  let at = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const data = change.data[index >> 1];
    const last = sections.at(-1);

    // A delete next to an insert is one replacement, wherever the change
    // split it.
    if (last && last.inserted >= 0 && inserted >= 0) {
      sections[sections.length - 1] = {
        ...last,
        data: sliceOf(last.data).concat(sliceOf(data)),
        inserted: last.inserted + inserted,
        length: last.length + length,
      };
    } else sections.push({ at, data, from, inserted, length });
    from += length;
    at += inserted < 0 ? length : inserted;
  }
  countCoreWork('carriedSections', sections.length);

  return sections;
};

const sliceOf = (data: SectionData) =>
  data instanceof PreparedTokenSlice ? data : PreparedTokenSlice.empty;

const keptReinserted = (sections: readonly Section[], before: DocumentIndex) =>
  sections.flatMap((section): Section[] => {
    if (section.inserted <= 0 || section.length === 0) return [section];

    const slice = sliceOf(section.data);
    const removedAt = (offset: number) =>
      before.slice(section.from + offset, section.from + offset + 1).tokens[0];
    const insertedAt = (offset: number) =>
      slice.slice(offset, offset + 1).tokens[0];
    const kind = removedAt(0)?.kind;

    if (kind === 'text') return [section];
    for (let offset = 1; offset < section.length; offset++) {
      if (removedAt(offset)?.kind !== kind) return [section];
    }

    let head = 0;
    let tail = 0;

    while (
      head < section.length &&
      head < section.inserted &&
      sameToken(removedAt(head), insertedAt(head))
    ) {
      head += 1;
    }
    while (
      tail < section.length - head &&
      tail < section.inserted - head &&
      sameToken(
        removedAt(section.length - 1 - tail),
        insertedAt(section.inserted - 1 - tail)
      )
    ) {
      tail += 1;
    }
    if (head + tail === 0) return [section];

    const length = section.length - head - tail;
    const inserted = section.inserted - head - tail;
    const kept = (from: number, at: number, count: number): Section[] =>
      count > 0 ? [{ at, data: null, from, inserted: -1, length: count }] : [];

    return [
      ...kept(section.from, section.at, head),
      ...(length > 0 || inserted > 0
        ? [
            {
              at: section.at + head,
              data: slice.slice(head, section.inserted - tail),
              from: section.from + head,
              inserted,
              length,
            },
          ]
        : []),
      ...kept(section.from + head + length, section.at + head + inserted, tail),
    ];
  });

const outputOf = (section: Section) =>
  section.inserted < 0 ? section.length : section.inserted;

type Move = Readonly<{
  deletion: Section;
  insertion: Section;
  /** The moved node is a text leaf. */
  leaf: boolean;
}>;

const moveOf = (
  sections: readonly Section[],
  change: RootChange,
  before: DocumentIndex
): Move | null => {
  if (!change.exactMove(before)) return null;

  const deletion = sections.find(
    (section) => section.inserted === 0 && section.length > 0
  );
  const insertion = sections.find(
    (section) => section.inserted > 0 && section.length === 0
  );

  return deletion && insertion && deletion.length === insertion.inserted
    ? {
        deletion,
        insertion,
        leaf: before.nodeStartingAt(deletion.from)?.kind === 'text',
      }
    : null;
};

/** The tokens a change keeps or moves exactly, from each side to the other. */
export class Correspondence {
  readonly move: Move | null;
  readonly sections: readonly Section[];

  constructor(
    change: RootChange,
    before: DocumentIndex,
    { keepReinserted = false }: Readonly<{ keepReinserted?: boolean }> = {}
  ) {
    const sections = sectionsOf(change);

    this.sections = keepReinserted
      ? keptReinserted(sections, before)
      : sections;
    this.move = moveOf(this.sections, change, before);
  }

  private find(position: number, end: (section: Section) => number) {
    let low = 0;
    let high = this.sections.length - 1;

    while (low < high) {
      const middle = (low + high) >> 1;

      if (end(this.sections[middle]) <= position) low = middle + 1;
      else high = middle;
    }

    return this.sections[low];
  }

  /** Where the change keeps input token `position`, or null. */
  target(position: number): number | null {
    const section = this.find(position, (each) => each.from + each.length);

    if (
      section?.inserted < 0 &&
      section.from <= position &&
      position < section.from + section.length
    ) {
      return section.at + position - section.from;
    }

    return this.moveTarget(position);
  }

  /** Where the move takes input token `position`, or null. */
  moveTarget(position: number): number | null {
    const { move } = this;

    return move &&
      move.deletion.from <= position &&
      position < move.deletion.from + move.deletion.length
      ? move.insertion.at + position - move.deletion.from
      : null;
  }

  /** What the change writes on input token `position`'s properties, or null. */
  modificationsAt(position: number): readonly PropertyModification[] | null {
    const section = this.find(position, (each) => each.from + each.length);

    return section?.inserted === -2 && section.from === position
      ? (section.data as readonly PropertyModification[])
      : null;
  }

  insertionAt(position: number): Section | null {
    const section = this.find(position, (each) => each.at + outputOf(each));

    return section &&
      section.inserted > 0 &&
      section.at <= position &&
      position < section.at + section.inserted
      ? section
      : null;
  }

  /** The input token output token `position` keeps, or null. */
  source(position: number): number | null {
    const section = this.find(position, (each) => each.at + outputOf(each));

    if (
      section?.inserted < 0 &&
      section.at <= position &&
      position < section.at + section.length
    ) {
      return section.from + position - section.at;
    }

    const { move } = this;

    return move &&
      move.insertion.at <= position &&
      position < move.insertion.at + move.insertion.inserted
      ? move.deletion.from + position - move.insertion.at
      : null;
  }

  /** The sections that delete or insert, other than the move. */
  replacements() {
    return this.sections.filter(
      (section) =>
        section.inserted >= 0 &&
        (section.length > 0 || section.inserted > 0) &&
        section !== this.move?.deletion &&
        section !== this.move?.insertion
    );
  }
}

/** One region of a document, a token per position. */
export class Tokens {
  readonly from: number;
  private readonly tokens: JsonToken[] = [];

  constructor(document: DocumentIndex, from: number, to: number) {
    this.from = from;
    for (const token of document.slice(from, to).tokens) {
      if (token.kind === 'text') {
        for (const unit of token.text.split('')) {
          this.tokens.push(textToken(unit));
        }
      } else this.tokens.push(token);
    }
    countCoreWork('carriedTokens', this.tokens.length);
  }

  get to() {
    return this.from + this.tokens.length;
  }

  at(position: number): JsonToken | undefined {
    return this.tokens[position - this.from];
  }

  isLetter(position: number) {
    return this.at(position)?.kind === 'text';
  }
}

const insideOf = (index: DocumentIndex, position: number) =>
  index
    .openContextAt(position)
    .filter((entry) => entry.from < position && position < entry.to);

export const propsOf = (index: DocumentIndex, entry: IndexedNodeRange) => {
  const [token] = index.slice(entry.from, entry.from + 1).tokens;

  return token?.kind === 'open' ? token.props : {};
};

export type Line = Readonly<{
  line: IndexedNodeRange;
  /** Its ancestors, outermost first. */
  ancestors: readonly IndexedNodeRange[];
  /** The leaf and inline elements around the position, outermost first. */
  within: readonly IndexedNodeRange[];
}>;

export const lineAt = (
  index: DocumentIndex,
  schema: CarriedProjectionSchema,
  position: number
): Line | null => {
  const stack = insideOf(index, position);

  for (let depth = stack.length - 1; depth >= 0; depth--) {
    const entry = stack[depth];

    if (entry.kind !== 'element') continue;

    const node = index.node(entry.path);

    if (schema.isInline(node)) continue;
    if (schema.isVoid(node)) return null;

    return node.children?.some((child) => typeof child.text === 'string')
      ? {
          ancestors: stack.slice(0, depth),
          line: entry,
          within: stack.slice(depth + 1),
        }
      : null;
  }

  return null;
};

export const closesOf = (entries: readonly IndexedNodeRange[]) =>
  entries.toReversed().map((entry) => closeToken(entry.kind));

export const opensOf = (
  index: DocumentIndex,
  entries: readonly IndexedNodeRange[]
) => entries.map((entry) => openToken(entry.kind, propsOf(index, entry)));

export const pieceOpensOf = (
  {
    edited,
    root,
    schema,
  }: Readonly<{
    edited: DocumentIndex;
    root: string;
    schema: CarriedProjectionSchema;
  }>,
  entries: readonly IndexedNodeRange[],
  landingParents: readonly JsonNode[]
) => {
  const ancestors = [...landingParents];

  return entries.map((entry) => {
    if (entry.kind !== 'element') {
      return openToken(entry.kind, propsOf(edited, entry));
    }

    const props = schema.splitProps(edited.node(entry.path), ancestors, root);

    ancestors.unshift({ ...props, children: [] });

    return openToken('element', props);
  });
};

/** How far a stretch of tokens closes, and the lowest depth it reaches. */
const depthOf = (read: Tokens, from: number, to: number) => {
  let depth = 0;
  let lowest = 0;

  for (let position = from; position < to; position++) {
    const token = read.at(position);

    if (token?.kind === 'open') depth += 1;
    else if (token?.kind === 'close') depth -= 1;
    lowest = Math.min(lowest, depth);
  }

  return { depth, lowest };
};

/**
 * A part of the projected document: tokens of the edited document, kept in
 * place by the mapped step or moved by it, or tokens made for the projection
 * with where each came from in `after`.
 */
type Part =
  | Readonly<{
      kind: 'copy';
      from: number;
      to: number;
      /** The mapped step keeps these tokens; otherwise it moves them. */
      kept: boolean;
      run?: true;
    }>
  | Readonly<{
      kind: 'make';
      tokens: readonly JsonToken[];
      origins: ReadonlyArray<number | null>;
      /** Where each token stays in the edited document, or null when it moves. */
      keptAt?: ReadonlyArray<number | null>;
      /** The run's tokens among `tokens`, and its span in the edited document. */
      run?: Readonly<{
        from: number;
        to: number;
        source: number;
        length: number;
      }>;
    }>;

const made = (
  tokens: readonly JsonToken[],
  origins: ReadonlyArray<number | null> = tokens.map(() => null)
): Part => ({ kind: 'make', origins, tokens });

/**
 * The letters of `[from, to)` that `keep` accepts, each stretch of a leaf in
 * a leaf of its own with that leaf's properties.
 */
const leavesOf = (
  index: DocumentIndex,
  read: Tokens,
  from: number,
  to: number,
  keep: (position: number) => boolean,
  origin: (position: number) => number | null
): Part => {
  const tokens: JsonToken[] = [];
  const origins: Array<number | null> = [];
  let open: JsonRecord | null = null;
  let leaf: JsonRecord = {};
  const close = () => {
    if (open === null) return;
    tokens.push(closeToken('text'));
    origins.push(null);
    open = null;
  };

  for (const entry of insideOf(index, from)) {
    if (entry.kind === 'text') leaf = propsOf(index, entry);
  }
  for (let position = from; position < to; position++) {
    const token = read.at(position);

    if (token?.kind === 'open' && token.nodeKind === 'text') {
      close();
      leaf = token.props;
    } else if (token?.kind === 'close' && token.nodeKind === 'text') {
      close();
    } else if (token?.kind === 'text' && keep(position)) {
      if (open === null) {
        tokens.push(openToken('text', leaf));
        origins.push(null);
        open = leaf;
      }
      tokens.push(textToken(token.text));
      origins.push(origin(position));
    }
  }
  close();

  return made(tokens, origins);
};

/**
 * Where a token goes in the step: before the run in a line the step keeps
 * (`head`), after the run's landing in a line whose tail the step deletes
 * (`tail`), before the run in the line the step takes it from (`lead`), or
 * with the run.
 */
type Side = 'head' | 'lead' | 'run' | 'tail';

const keeps = (side: Side | undefined): side is 'head' | 'run' =>
  side === 'head' || side === 'run';

type Item = Readonly<{
  from: number;
  /** The end of its last letter, or of the item when it holds none. */
  to: number;
  side: Side;
}>;

type Shape = Readonly<{
  /** The run lands after its source, as an undo of a merge does. */
  forward: boolean;
  source: number;
  end: number;
  landing: number;
  landingBefore: number;
  /** The run's first letter, or null when it holds none. */
  letter: number | null;
  letters: boolean;
  /**
   * Where a run with no letters starts, before the leaf closes in front of
   * it, since a leaf boundary never moves a letter.
   */
  point: number;
}>;

const shapeOf = (input: CarriedProjectionInput): Shape => {
  const { before, runs, step } = input;
  const sorted = runs.toSorted((left, right) => left.source - right.source);
  const [first] = sorted;
  let end = first.source + first.length;
  let landingEnd = first.at + first.length;

  for (const run of sorted.slice(1)) {
    if (run.source !== end || run.at !== landingEnd) {
      refuse('The runs do not form one stretch.');
    }
    end += run.length;
    landingEnd += run.length;
  }

  const landingBefore =
    mapRootChangePositionBackward(step, first.at, -1) ??
    refuse('The run lands where the step inserts.');
  const read = new Tokens(before, first.source, end);
  let letter: number | null = null;

  for (let position = first.source; position < end; position++) {
    if (read.isLetter(position)) {
      letter = position;
      break;
    }
  }

  const letters = letter !== null;

  let point = first.source;

  if (!letters) {
    while (
      point > 0 &&
      before.slice(point - 1, point).tokens[0]?.kind === 'close' &&
      lineAt(before, input.schema, point - 1)?.within.length
    ) {
      point -= 1;
    }
  }

  return {
    end,
    forward: landingBefore >= end,
    landing: first.at,
    landingBefore,
    letter,
    letters,
    point,
    source: first.source,
  };
};

const insertsAtRun = (shape: Shape, position: number) =>
  position >= shape.point &&
  (position < shape.end || position === shape.source);

export const relocatesCarriedBlock = (input: CarriedProjectionInput) => {
  const { before, edit } = input;

  if (edit.exactMove(before)) return false;

  const shape = shapeOf(input);
  const sections = sectionsOf(edit);
  const deletion = sections.find(
    (section) =>
      section.inserted === 0 &&
      section.from <= shape.source &&
      shape.end <= section.from + section.length
  );
  if (!deletion) return false;

  const block = before.nodeStartingAt(deletion.from);

  if (
    block?.kind !== 'element' ||
    block.path.length !== 1 ||
    block.to !== deletion.from + deletion.length
  ) {
    return false;
  }

  const node = before.node(block.path);

  return sections.some((section) => {
    if (section.length > 0 || section.inserted <= 0) return false;
    if (insideOf(before, section.from).length > 0) return false;

    const slice = sliceOf(section.data);

    if (slice.tokens[0]?.kind !== 'open') return false;

    try {
      const { nodes } = decodeNodes(slice);

      return nodes.length === 1 && jsonEqual(nodes[0], node);
    } catch {
      return false;
    }
  });
};

const lineOfRun = (input: CarriedProjectionInput, shape: Shape) => {
  const line = lineAt(input.before, input.schema, shape.source)?.line;

  return line &&
    line.contentFrom <= shape.source &&
    line.contentFrom <= shape.landingBefore &&
    shape.landingBefore <= line.contentTo &&
    lineAt(input.after, input.schema, shape.landing)?.line.from === line.from
    ? line
    : null;
};

export const mapPosThroughBlockMove = (
  change: RootChange,
  before: DocumentIndex
) => {
  const edit = new Correspondence(change, before);

  return (position: number) =>
    (edit.move?.leaf ? null : edit.moveTarget(position)) ??
    change.mapPos(position, 1);
};

export const liftsCarriedLine = (input: CarriedProjectionInput) => {
  if (rewritesRunLines(input)) return false;

  const lift = liftOf(input.step, input.before);

  return (
    lift?.movesMore === true &&
    lift.cut === Math.min(...input.runs.map(({ source }) => source))
  );
};

const rewritesRunLines = (input: CarriedProjectionInput) => {
  const { before, edit, schema } = input;
  const shape = shapeOf(input);
  const spans = [
    { from: shape.source, to: shape.end },
    ...[shape.source, shape.landingBefore].flatMap((position) => {
      const found = lineAt(before, schema, position);

      return found ? [found.line] : [];
    }),
  ];

  return sectionsOf(edit).some(
    ({ data, from, inserted, length }) =>
      inserted > 0 &&
      (length > 0 ||
        sliceOf(data).tokens.some((token) => token.kind !== 'text')) &&
      spans.some((span) => from <= span.to && span.from <= from + length)
  );
};

/**
 * Whether `edit` reaches the run: it deletes a token of it, inserts from its
 * first token up to its last or where it holds no letter, writes between a
 * run that stays in its line and where it lands, or writes properties on a
 * node that holds its letters.
 */
export const touchesCarriedRuns = (input: CarriedProjectionInput) => {
  const shape = shapeOf(input);
  const edit = new Correspondence(input.edit, input.before);
  const holders =
    shape.letter === null ? [] : insideOf(input.before, shape.letter);
  const steps = sectionsOf(input.step);
  const deletes = steps.filter(
    (section) => section.inserted >= 0 && section.length > 0
  );
  const inserts = steps.filter((section) => section.inserted > 0);
  const deletesWhereStepInserts = (section: Section) =>
    section.length > 0 &&
    inserts.some(
      (inserted) =>
        section.from <= inserted.from &&
        inserted.from <= section.from + section.length
    );
  const line = shape.letters ? lineOfRun(input, shape) : null;
  const { move } = edit;

  // A block move of the run's whole line keeps each of its tokens, so the
  // ordinary map keeps the run.
  if (
    line &&
    move &&
    !move.leaf &&
    move.deletion.from <= line.from &&
    line.to <= move.deletion.from + move.deletion.length
  ) {
    return false;
  }

  const crossFrom = Math.min(shape.source, shape.landingBefore);
  const crossTo = Math.max(shape.end, shape.landingBefore);
  const writes = edit.sections.some((section) => {
    const end = section.from + section.length;

    if (section.inserted === -1) return false;
    if (section.from < shape.end && end > shape.source) return true;
    if (line && section.from <= crossTo && end >= crossFrom) return true;
    if (deletesWhereStepInserts(section)) return true;
    if (section.inserted === -2) {
      return holders.some(({ from }) => section.from <= from && from < end);
    }

    // The ordinary map drops what is typed where the step deletes on both
    // sides of it.
    return (
      section.inserted > 0 &&
      (insertsAtRun(shape, section.from) ||
        deletes.some(
          (deleted) =>
            deleted.from < Math.max(end, section.from + 1) &&
            section.from < deleted.from + deleted.length &&
            (section.length > 0 || section.from > deleted.from)
        ))
    );
  });

  if (writes || shape.letter === null) return writes;

  // An edit that splits a leaf or wraps an element before the run's first
  // letter gives that letter new parents without writing inside the run.
  const letter = edit.target(shape.letter);
  const parents = letter === null ? [] : insideOf(input.edited, letter);

  return (
    letter === null ||
    parents.length !== holders.length ||
    holders.some(
      (holder, depth) => edit.target(holder.from) !== parents[depth].from
    )
  );
};

type Region = Readonly<{
  from: number;
  to: number;
  editedFrom: number;
  editedTo: number;
  leading: readonly Section[];
  trailing: readonly Section[];
}>;

/**
 * The stretch of `before` the projection rebuilds: it holds every change of
 * the step, and every replacement of the edit that reaches it whole.
 */
const regionOf = (
  edit: Correspondence,
  initialFrom: number,
  initialTo: number,
  length: number,
  lineOf: (position: number) => IndexedNodeRange | null
): Region => {
  let from = initialFrom;
  let to = initialTo;
  let closed = false;
  const { move } = edit;
  const replacements = edit.replacements();

  while (!closed) {
    closed = true;

    // The region holds whole lines, so a line the edit joined to a merged
    // one comes with it.
    const first = lineOf(from);
    const last = lineOf(to);

    if (first && first.from < from) {
      ({ from } = first);
      closed = false;
    }
    if (last && last.to > to) {
      ({ to } = last);
      closed = false;
    }
    for (const section of replacements) {
      const end = section.from + section.length;

      if (section.from < from && end > from) {
        ({ from } = section);
        closed = false;
      }
      if (section.from < to && end > to) {
        to = end;
        closed = false;
      }
    }
    if (move) {
      const { deletion, insertion } = move;
      const reached =
        (deletion.from < to && deletion.from + deletion.length > from) ||
        (insertion.from > from && insertion.from < to);

      if (reached) {
        const moveFrom = Math.min(deletion.from, insertion.from);
        const moveTo = Math.max(
          deletion.from + deletion.length,
          Math.min(insertion.from + 1, length)
        );

        if (moveFrom < from || moveTo > to) {
          from = Math.min(from, moveFrom);
          to = Math.max(to, moveTo);
          closed = false;
        }
      }
    }
  }

  // An insertion at the region's end is inside it only when it lands a move.
  const inside = (section: Section) =>
    section.length > 0
      ? section.from >= from && section.from + section.length <= to
      : section.from > from &&
        (section.from < to ||
          (section.from === to && section === move?.insertion));
  const leading: Section[] = [];
  const trailing: Section[] = [];

  for (const section of edit.sections) {
    const end = section.from + section.length;

    if (section.inserted === -1 && section.from < from && end > from) {
      leading.push({ ...section, length: from - section.from });
    } else if (section.length > 0 ? end <= from : section.from <= from) {
      leading.push(section);
    }
    if (section.inserted === -1 && section.from < to && end > to) {
      trailing.push({
        ...section,
        at: section.at + to - section.from,
        from: to,
        length: end - to,
      });
    } else if (
      section.from >= to &&
      !inside(section) &&
      !(section.length === 0 && section.from <= from)
    ) {
      trailing.push(section);
    }
  }

  let editedFrom = 0;

  for (const section of leading) {
    editedFrom = Math.max(editedFrom, section.at + outputOf(section));
  }

  const last = edit.sections.at(-1);
  const editedTo =
    trailing.length > 0 ? trailing[0].at : last ? last.at + outputOf(last) : 0;

  return { editedFrom, editedTo, from, leading, to, trailing };
};

/**
 * `region` grown in `edited` through `editedTo`, over what the edit inserts
 * at its end, such as the close of a wrapper the projection steps out of.
 */
const regionThrough = (region: Region, editedTo: number): Region => {
  if (editedTo <= region.editedTo) return region;

  const count = region.trailing.findIndex((section) => section.at >= editedTo);
  const taken =
    count === -1 ? region.trailing : region.trailing.slice(0, count);
  const last = taken.at(-1);

  if (
    taken.some((section) => section.length > 0 || section.inserted <= 0) ||
    !last ||
    last.at + outputOf(last) !== editedTo
  ) {
    refuse('The projection reaches past what the edit inserted at its end.');
  }

  return {
    ...region,
    editedTo,
    trailing: region.trailing.slice(taken.length),
  };
};

/** A letter with its leaf's properties, or an element token, of one line. */
type Unit = Readonly<{
  at: number;
  props: JsonRecord | null;
  token: JsonToken;
}>;

const unitsOf = (index: DocumentIndex, line: IndexedNodeRange) => {
  const read = new Tokens(index, line.contentFrom, line.contentTo);
  const units: Unit[] = [];
  let leaf: JsonRecord = {};

  for (let at = line.contentFrom; at < line.contentTo; at++) {
    const token = read.at(at);

    if (token?.kind === 'text') units.push({ at, props: leaf, token });
    else if (token?.nodeKind === 'text') {
      if (token.kind === 'open') leaf = token.props;
    } else if (token) units.push({ at, props: null, token });
  }

  return units;
};

const enclosingOf = (list: readonly Unit[], index: number) => {
  let depth = 0;

  for (let at = index - 1; at >= 0; at--) {
    const { props, token } = list[at];

    if (props !== null) continue;
    if (token.kind === 'close') depth += 1;
    else if (depth === 0) return list[at];
    else depth -= 1;
  }

  return undefined;
};

const directLettersOf = (list: readonly Unit[], open: Unit) => {
  const letters: Unit[] = [];
  let depth = 0;

  for (let index = list.indexOf(open) + 1; index < list.length; index++) {
    const unit = list[index];

    if (unit.props !== null) {
      if (depth === 0) letters.push(unit);
    } else if (unit.token.kind === 'open') depth += 1;
    else if (depth === 0) break;
    else depth -= 1;
  }

  return letters;
};

const elementOf = (list: readonly Unit[], unit: Unit) =>
  unit.token.kind === 'open' ? unit : enclosingOf(list, list.indexOf(unit));

const sameUnit = (left: Unit, right: Unit) =>
  sameToken(left.token, right.token) &&
  (left.props === null
    ? right.props === null
    : right.props !== null && jsonEqual(left.props, right.props));

const emptyLeafOf = (read: Tokens) => (at: number) => {
  const open = read.at(at - 2);
  const close = read.at(at - 1);

  return open?.kind === 'open' &&
    open.nodeKind === 'text' &&
    close?.kind === 'close' &&
    close.nodeKind === 'text'
    ? open.props
    : {};
};

/**
 * The tokens of a line's content: its letters in leaves by their properties,
 * and an empty leaf where an element token would touch another one or the
 * line's edge, with the properties `emptyLeaf` gives for the unit after it, or
 * for the line's end. `indexes` gives each token's index in `units`, or null
 * for a leaf token.
 */
const contentOf = (
  units: readonly Unit[],
  emptyLeaf: (next: Unit | undefined) => JsonRecord
) => {
  const tokens: JsonToken[] = [];
  const indexes: Array<number | null> = [];
  let leaf: JsonRecord | null = null;
  let filled = false;
  const push = (token: JsonToken, index: number | null) => {
    tokens.push(token);
    indexes.push(index);
  };
  const close = () => {
    if (leaf === null) return;
    push(closeToken('text'), null);
    leaf = null;
  };
  const fill = (next?: Unit) => {
    if (filled) return;
    push(openToken('text', emptyLeaf(next)), null);
    push(closeToken('text'), null);
  };

  units.forEach((unit, index) => {
    if (unit.props === null) {
      close();
      fill(unit);
      push(unit.token, index);
      filled = false;
      return;
    }
    if (leaf === null || !jsonEqual(leaf, unit.props)) {
      close();
      push(openToken('text', unit.props), null);
      leaf = unit.props;
    }
    push(unit.token, index);
    filled = true;
  });
  close();
  fill();

  return { indexes, tokens };
};

/**
 * A step that moves letters inside one line, mapped as the edited line with
 * those letters, and what the edit typed with them, moved the same way past
 * the edges they cross. Null when the run holds no letters or the step writes
 * outside its line; a refusal when the step is not one move of the run's
 * letters or the edit leaves the move no place.
 */
const inLineOf = (
  input: CarriedProjectionInput,
  shape: Shape,
  stepMap: Correspondence,
  editMap: Correspondence
): CarriedProjection | null => {
  if (!shape.letters) return null;

  const { after, before, edited, schema, step } = input;
  const line = lineOfRun(input, shape);

  if (!line) return null;
  for (const section of stepMap.sections) {
    if (section.inserted === -1) continue;
    if (
      section.inserted === -2 ||
      section.from < line.contentFrom ||
      section.from + section.length > line.contentTo
    ) {
      refuse('The step writes more than its line’s letters.');
    }
  }

  const grown = step.newLength - step.length;
  const lineAfter =
    lineAt(after, schema, shape.landing)?.line ??
    refuse('The run lands outside a line.');

  if (lineAfter.contentTo !== line.contentTo + grown) {
    refuse('The step changes its line’s length.');
  }

  const readBefore = new Tokens(before, line.contentFrom, line.contentTo);
  const landedEnd = shape.landing + shape.end - shape.source;
  const inRun = (at: number) => shape.source <= at && at < shape.end;
  const landed = (at: number) => shape.landing <= at && at < landedEnd;
  const unitsBefore = unitsOf(before, line);
  const unitsAfter = unitsOf(after, lineAfter);
  const run = unitsBefore.filter((unit) => inRun(unit.at));
  const rest = unitsBefore.filter((unit) => !inRun(unit.at));
  const runAfter = unitsAfter.filter((unit) => landed(unit.at));
  const restAfter = unitsAfter.filter((unit) => !landed(unit.at));
  const slot = unitsAfter.findIndex((unit) => landed(unit.at));
  const runStart = rest.filter((unit) => unit.at < shape.source).length;

  if (
    run.some((unit) => unit.props === null) ||
    run.length !== runAfter.length ||
    rest.length !== restAfter.length ||
    !run.every((unit, at) => sameUnit(unit, runAfter[at])) ||
    !rest.every((unit, at) => sameUnit(unit, restAfter[at])) ||
    !runAfter.every((unit, at) => unitsAfter[slot + at] === unit) ||
    slot === runStart
  ) {
    refuse('The step is not one move of letters inside its line.');
  }

  const emptyBefore = emptyLeafOf(readBefore);
  const rebuilt = contentOf(
    [...rest.slice(0, slot), ...run, ...rest.slice(slot)],
    (next) => emptyBefore(next?.at ?? line.contentTo)
  ).tokens;
  const readLine = new Tokens(
    after,
    lineAfter.contentFrom,
    lineAfter.contentTo
  );

  if (
    rebuilt.length !== lineAfter.contentTo - lineAfter.contentFrom ||
    !rebuilt.every((token, at) =>
      sameToken(token, readLine.at(lineAfter.contentFrom + at))
    )
  ) {
    refuse('The step’s line has leaves the projection would not write.');
  }

  const afterAt = new Map<number, number>();

  run.forEach((unit, at) => afterAt.set(unit.at, runAfter[at].at));
  rest.forEach((unit, at) => afterAt.set(unit.at, restAfter[at].at));

  const afterOf = (source: number) =>
    source >= line.contentFrom && source < line.contentTo
      ? (afterAt.get(source) ?? null)
      : stepMap.target(source);

  const forward = slot > runStart;
  const edge =
    rest[forward ? slot - 1 : slot] ?? refuse('The run crosses no edge.');
  const edgeAt = editMap.target(edge.at);
  const crossed = rest.slice(
    Math.min(slot, runStart),
    Math.max(slot, runStart)
  );
  const partner = (() => {
    const direction = edge.token.kind === 'close' ? -1 : 1;
    let depth = 0;

    for (
      let index = unitsBefore.indexOf(edge);
      index >= 0 && index < unitsBefore.length;
      index += direction
    ) {
      const { props, token } = unitsBefore[index];

      if (props !== null) continue;
      depth += token.kind === edge.token.kind ? 1 : -1;
      if (depth === 0) return unitsBefore[index];
    }

    return undefined;
  })();
  const edgeGone =
    edgeAt === null &&
    (partner === undefined || editMap.target(partner.at) === null);
  const firstReplaced = (section: Section) => {
    for (
      let position = Math.max(section.from, line.contentFrom);
      position < Math.min(section.from + section.length, line.contentTo);
      position++
    ) {
      if (readBefore.isLetter(position)) return position;
    }

    return null;
  };
  const replacesRun = (section: Section) => {
    const replaced = section.inserted > 0 ? firstReplaced(section) : null;

    return replaced !== null && inRun(replaced);
  };
  const lineOf = (position: number) =>
    lineAt(before, schema, position)?.line ?? null;
  const region = regionOf(editMap, line.from, line.to, before.length, lineOf);
  const readNear = new Tokens(edited, region.editedFrom, region.editedTo);
  const keptRun = run
    .map((unit) => editMap.target(unit.at))
    .find((at) => at !== null);
  const typed = editMap.sections.find(replacesRun);
  const typedEnd = typed ? typed.at + typed.inserted : 0;
  let typedRun: number | undefined;

  for (let at = typed?.at ?? 0; at < typedEnd; at++) {
    if (readNear.isLetter(at)) {
      typedRun = at;
      break;
    }
  }

  const runAt = keptRun ?? typedRun;
  const unplaced = new Set<number>();
  const { move } = editMap;

  if (move?.leaf) {
    for (
      let source = move.deletion.from;
      source < move.deletion.from + move.deletion.length;
      source++
    ) {
      const origin = afterOf(source);

      if (origin !== null) unplaced.add(origin);
    }
  }

  const originOf = (position: number) => {
    const source = editMap.source(position);

    return source === null ? null : afterOf(source);
  };
  const projected = (parts: Part[]) => {
    countCoreWork('carriedLines', 1);

    return assemble({
      edited,
      editMap,
      grown,
      originOf,
      parts,
      read: new Tokens(edited, region.editedFrom, region.editedTo),
      readAfter: new Tokens(after, region.from, region.to + grown),
      region,
      root: input.root,
      unplaced,
    });
  };
  const keepRegion = () =>
    projected([
      {
        from: region.editedFrom,
        kept: true,
        kind: 'copy',
        to: region.editedTo,
      },
    ]);

  if (runAt === undefined) return keepRegion();

  // The edited line is the one that holds the run's letters, which a split
  // can carry to a new line.
  const editedLine =
    lineAt(edited, schema, runAt)?.line ??
    refuse('The edit moved the run out of a line.');

  if (
    editedLine.contentFrom < region.editedFrom ||
    editedLine.contentTo > region.editedTo
  ) {
    refuse('The edited line leaves the region.');
  }
  for (const unit of run) {
    const kept = editMap.target(unit.at);

    if (
      kept !== null &&
      (kept < editedLine.contentFrom || kept >= editedLine.contentTo)
    ) {
      refuse('The edit moved a letter of the run out of its line.');
    }
  }

  const units = unitsOf(edited, editedLine);
  const replacedRuns = new Map<Section, boolean | null>();
  const replacedRun = (at: number) => {
    const section = editMap.insertionAt(at);

    if (!section) return null;
    if (!replacedRuns.has(section)) {
      const replaced = firstReplaced(section);

      replacedRuns.set(section, replaced === null ? null : inRun(replaced));
    }

    return replacedRuns.get(section) ?? null;
  };

  // What the edit typed goes with the first letter it replaced, or else with
  // the letter before it, or right after the run's edge with the letter after
  // it.
  let previous: boolean | null = null;
  const sides = units.map((unit) => {
    if (unit.props === null) {
      previous = unit.at === edgeAt ? null : false;

      return false;
    }

    const source = editMap.source(unit.at);

    previous =
      source !== null ? inRun(source) : (replacedRun(unit.at) ?? previous);

    return previous;
  });
  let next = false;

  for (let index = sides.length - 1; index >= 0; index--) {
    if (units[index].props === null) {
      next = false;
      continue;
    }
    next = sides[index] ?? next;
    sides[index] = next;
  }

  const moves = sides.map((side) => side === true);
  const first = moves.indexOf(true);
  const last = moves.lastIndexOf(true);
  const head = units[first];
  const tail = units[last];

  if (head === undefined || tail === undefined) return keepRegion();
  if (moves.slice(first, last + 1).includes(false)) {
    refuse('The edit split the run.');
  }

  const moved = units.slice(first, last + 1);
  const indexAt = new Map(units.map((unit, index) => [unit.at, index]));
  const unitAt = (at: number | null) => {
    const index = at === null ? undefined : indexAt.get(at);

    return index === undefined ? undefined : units[index];
  };
  const parentOf = (unit: Unit) => {
    const index = indexAt.get(unit.at);

    return index === undefined ? undefined : enclosingOf(units, index);
  };
  const insideOriginal = (editedOpen: Unit, original: number | null) => {
    for (let holder = parentOf(editedOpen); holder; holder = parentOf(holder)) {
      if (holder.at === original) return true;
    }

    return false;
  };
  const restStayedTogether = (beforeOpen: Unit, original: number | null) =>
    directLettersOf(unitsBefore, beforeOpen).every((letter) => {
      if (inRun(letter.at)) return true;

      const kept = unitAt(editMap.target(letter.at));
      const holder = kept && parentOf(kept);

      return (
        !kept ||
        (holder !== undefined &&
          (holder.at === original || sameUnit(holder, beforeOpen)))
      );
    });
  const isSplitCopy = (beforeOpen: Unit, editedOpen: Unit) => {
    const original = editMap.target(beforeOpen.at);

    return (
      sameUnit(beforeOpen, editedOpen) &&
      !insideOriginal(editedOpen, original) &&
      restStayedTogether(beforeOpen, original)
    );
  };
  const sameElement = (
    beforeOpen: Unit | undefined,
    editedOpen: Unit | undefined
  ) =>
    beforeOpen === undefined || editedOpen === undefined
      ? beforeOpen === editedOpen
      : editMap.target(beforeOpen.at) === editedOpen.at ||
        isSplitCopy(beforeOpen, editedOpen);
  const edgeElement = elementOf(unitsBefore, edge);
  const isEdgeElement = (open: Unit | undefined) =>
    sameElement(edgeElement, open);

  if (
    !sameElement(
      enclosingOf(unitsBefore, unitsBefore.indexOf(run[0])),
      enclosingOf(units, first)
    )
  ) {
    return keepRegion();
  }

  const edgeUnit = units.find((unit) => unit.at === edgeAt);
  let anchorAt =
    edgeUnit && isEdgeElement(elementOf(units, edgeUnit)) ? edgeUnit.at : null;

  // A split can carry the edge's token to the other line or write a new one,
  // leaving an equal edge beside the moved letters. An equal edge on their
  // other side means the edit already took them past it, and a removed edge
  // means it took the element away.
  if (anchorAt === null) {
    const near = forward ? units[last + 1] : units[first - 1];
    const far = forward ? units[first - 1] : units[last + 1];

    if (
      crossed.length === 1 &&
      near &&
      sameUnit(near, edge) &&
      isEdgeElement(elementOf(units, near))
    ) {
      anchorAt = near.at;
    } else if (
      (crossed.length === 1 && far && sameUnit(far, edge)) ||
      (edgeGone && crossed.every((unit) => editMap.target(unit.at) === null))
    ) {
      return keepRegion();
    } else if (edgeGone) {
      refuse('The edit removed part of what the run crosses.');
    } else refuse('The edit moved the run’s edge out of its line.');
  }

  const placed: Unit[] = [];

  units.forEach((unit, index) => {
    if (moves[index]) return;
    if (!forward && unit.at === anchorAt) placed.push(...moved);
    placed.push(unit);
    if (forward && unit.at === anchorAt) placed.push(...moved);
  });
  if (placed.length !== units.length) refuse('The run’s edge left the line.');

  const readEdited = new Tokens(
    edited,
    editedLine.contentFrom,
    editedLine.contentTo
  );
  const emptyEdited = emptyLeafOf(readEdited);
  const content = contentOf(placed, (following) =>
    emptyEdited(following?.at ?? editedLine.contentTo)
  );
  const origins = content.indexes.map((index) =>
    index === null ? null : originOf(placed[index].at)
  );
  const runFrom = content.indexes.indexOf(placed.indexOf(head));
  const runTo = content.indexes.indexOf(placed.indexOf(tail)) + 1;
  const movedSet = new Set(moved);
  const stays = (index: number | null) =>
    index !== null && !movedSet.has(placed[index]);
  // A leaf token stays when the teammate's line holds it at the same distance
  // from the nearest letter or element that stays.
  const keptOf = (at: number, direction: 1 | -1) => {
    for (
      let near = at + direction;
      near >= 0 && near < content.tokens.length;
      near += direction
    ) {
      const index = content.indexes[near];

      if (index === null) continue;
      if (!stays(index)) return null;

      const kept = placed[index].at - (near - at);

      return sameToken(content.tokens[at], readEdited.at(kept)) ? kept : null;
    }

    return null;
  };
  const kept = content.tokens.map((token, at) => {
    const index = content.indexes[at];

    if (at >= runFrom && at < runTo) return null;
    if (index !== null) return stays(index) ? placed[index].at : null;

    return token.kind === 'open'
      ? (keptOf(at, 1) ?? keptOf(at, -1))
      : (keptOf(at, -1) ?? keptOf(at, 1));
  });

  return projected([
    {
      from: region.editedFrom,
      kept: true,
      kind: 'copy',
      to: editedLine.contentFrom,
    },
    {
      keptAt: kept,
      kind: 'make',
      origins,
      run: {
        from: runFrom,
        length: tail.at + 1 - head.at,
        source: head.at,
        to: runTo,
      },
      tokens: content.tokens,
    },
    {
      from: editedLine.contentTo,
      kept: true,
      kind: 'copy',
      to: region.editedTo,
    },
  ]);
};

/** Map a step that carries a run through `edit` by the letters it kept. */
export const projectCarriedStep = (
  input: CarriedProjectionInput
): CarriedProjection => {
  const { after, before, edit, edited, schema, step } = input;
  const shape = shapeOf(input);
  const stepMap = new Correspondence(step, before);
  const editMap = new Correspondence(edit, before, { keepReinserted: true });
  const inLine = inLineOf(input, shape, stepMap, editMap);

  if (inLine) return inLine;

  const sourceLine =
    lineAt(before, schema, shape.source) ??
    refuse('The run starts outside a line.');
  const landingLine = shape.forward
    ? null
    : (lineAt(before, schema, shape.landingBefore) ??
      refuse('The run lands outside a line.'));
  const lines = {
    from: landingLine?.line.from ?? sourceLine.line.from,
    to: Math.max(shape.end, sourceLine.line.to),
  };
  let changedFrom = step.length;
  let changedTo = 0;

  for (const section of stepMap.sections) {
    if (section.inserted === -1) continue;
    changedFrom = Math.min(changedFrom, section.from);
    changedTo = Math.max(changedTo, section.from + section.length);
  }

  const drawn = regionOf(
    editMap,
    Math.min(lines.from, changedFrom),
    Math.max(lines.to, changedTo, shape.landingBefore),
    before.length,
    (position) => lineAt(before, schema, position)?.line ?? null
  );
  const grown = step.newLength - step.length;
  const read = new Tokens(edited, drawn.editedFrom, drawn.editedTo);
  const readBefore = new Tokens(before, drawn.from, drawn.to);
  const readAfter = new Tokens(after, drawn.from, drawn.to + grown);
  const sideOf = (position: number): Side => {
    if (shape.source <= position && position < shape.end) return 'run';
    if (shape.forward || stepMap.target(position) !== null) return 'head';

    return position < getLine(landingLine).line.to ? 'tail' : 'lead';
  };
  const items = itemsOf({
    edited,
    editMap,
    lines,
    read,
    readBefore,
    schema,
    shape,
    sideOf,
  });
  const afterOf = (source: number) =>
    shape.source <= source && source < shape.end
      ? shape.landing + source - shape.source
      : stepMap.target(source);
  const originOf = (position: number) => {
    const source = editMap.source(position);

    return source === null ? null : afterOf(source);
  };
  // A text leaf the edit deletes and inserts again may hold letters retyped,
  // not moved, so the letter map places none of its letters.
  const unplaced = new Set<number>();
  const moved = editMap.move;

  if (moved?.leaf) {
    const { from, length } = moved.deletion;

    for (let source = from; source < from + length; source++) {
      const origin = afterOf(source);

      if (origin !== null) unplaced.add(origin);
    }
  }
  const context = {
    after,
    before,
    edited,
    editMap,
    items,
    originOf,
    read,
    readAfter,
    root: input.root,
    schema,
    shape,
    stepMap,
  };
  const built = shape.forward
    ? forwardParts(context, sourceLine)
    : backwardParts(context, getLine(landingLine));
  const region = regionThrough(drawn, built.to);
  const parts: readonly Part[] = [
    { from: region.editedFrom, kept: true, kind: 'copy', to: built.from },
    ...built.parts,
    { from: built.to, kept: true, kind: 'copy', to: region.editedTo },
  ];
  const copied = (position: number | null) =>
    position !== null &&
    parts.some(
      (part) =>
        part.kind === 'copy' &&
        part.kept &&
        part.from <= position &&
        position < part.to
    );

  for (const section of stepMap.sections) {
    if (section.inserted !== -2) continue;
    for (let at = section.from; at < section.from + section.length; at++) {
      if (copied(editMap.target(at))) {
        refuse('The step sets properties on a node the edit keeps.');
      }
    }
  }

  const projection = assemble({
    edited,
    editMap,
    originOf,
    parts,
    read,
    readAfter,
    region,
    root: input.root,
    grown,
    unplaced,
  });

  if (projection.runs.length === 0) refuse('The run has no place.');

  return projection;
};

const getLine = (line: Line | null) =>
  line ?? refuse('The step has no line to land in.');

const itemsOf = ({
  edited,
  editMap,
  lines,
  read,
  readBefore,
  schema,
  shape,
  sideOf,
}: Readonly<{
  edited: DocumentIndex;
  editMap: Correspondence;
  lines: Readonly<{ from: number; to: number }>;
  read: Tokens;
  readBefore: Tokens;
  schema: CarriedProjectionSchema;
  shape: Shape;
  sideOf: (position: number) => Side;
}>): readonly Item[] => {
  const items: Item[] = [];
  const kept = new Map<number, Side>();

  for (let position = read.from; position < read.to; position++) {
    if (!read.isLetter(position)) continue;

    const source = editMap.source(position);

    if (source === null || source < lines.from || source >= lines.to) {
      continue;
    }

    const side = sideOf(source);

    kept.set(position, side);
    items.push({ from: position, side, to: position + 1 });
  }

  // The kept letters of the line around `position`, nearest first.
  const near = (position: number, direction: -1 | 1) => {
    const line = lineAt(edited, schema, position);
    const sides: Side[] = [];

    if (!line) return { line, sides };

    const from = Math.max(line.line.from, read.from);
    const to = Math.min(line.line.to, read.to);

    for (
      let at = direction < 0 ? position - 1 : position;
      at >= from && at < to;
      at += direction
    ) {
      const side = kept.get(at);

      if (side) sides.push(side);
      if (keeps(side)) break;
    }

    return { line, sides };
  };

  for (const section of editMap.replacements()) {
    const end = section.from + section.length;

    if (
      section.inserted === 0 ||
      (section.length > 0
        ? section.from >= lines.to || end <= lines.from
        : section.from < lines.from || section.from >= lines.to)
    ) {
      continue;
    }

    const from = section.at;
    const to = from + section.inserted;
    let last = from;

    for (let position = from; position < to; position++) {
      if (read.isLetter(position)) last = position + 1;
    }

    items.push({
      from,
      side: pieceSide({ near, readBefore, section, shape, sideOf }),
      to: last > from ? last : to,
    });
  }

  return items.sort((left, right) => left.from - right.from);
};

const pieceSide = ({
  near,
  readBefore,
  section,
  shape,
  sideOf,
}: Readonly<{
  near: (
    position: number,
    direction: -1 | 1
  ) => { line: Line | null; sides: Side[] };
  readBefore: Tokens;
  section: Section;
  shape: Shape;
  sideOf: (position: number) => Side;
}>): Side => {
  // Once a run's letters are gone, what is typed where they were joins it.
  if (!shape.letters && insertsAtRun(shape, section.from)) return 'run';

  for (
    let position = Math.max(section.from, readBefore.from);
    position < Math.min(section.from + section.length, readBefore.to);
    position++
  ) {
    if (readBefore.isLetter(position)) return sideOf(position);
  }

  const behind = near(section.at, -1);
  const nearest = behind.sides[0];

  if (keeps(nearest)) return nearest;

  const ahead = near(section.at + section.inserted, 1);
  const next = ahead.sides.find(keeps);

  if (next) return next;
  if (nearest) return nearest;
  if (ahead.sides[0]) return ahead.sides[0];

  // A line that keeps no letter keeps its content where the step puts it.
  if (section.from > shape.source && section.from < shape.end) return 'run';

  return shape.forward ? 'head' : 'lead';
};

type Context = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  edited: DocumentIndex;
  editMap: Correspondence;
  items: readonly Item[];
  read: Tokens;
  readAfter: Tokens;
  root: string;
  schema: CarriedProjectionSchema;
  shape: Shape;
  stepMap: Correspondence;
  /** Where a token of the edited document stood in the step's result. */
  originOf: (position: number) => number | null;
}>;

type Built = Readonly<{ from: number; parts: readonly Part[]; to: number }>;

/** The end of the last line that holds a run item, at least `end`. */
const runEnd = ({ edited, items, schema }: Context, end: number) => {
  let result = end;

  for (const item of items) {
    if (item.side !== 'run') continue;

    const line = lineAt(edited, schema, Math.max(item.from, item.to - 1));

    result = Math.max(result, line?.line.to ?? item.to);
  }

  return result;
};

/** Move `position` out of the leaf and inline elements it closes. */
const pastCloses = (
  { edited, schema }: Context,
  position: number,
  limit: number
) => {
  let at = position;

  while (
    at < limit &&
    lineAt(edited, schema, at)?.within.at(-1)?.to === at + 1
  ) {
    at += 1;
  }

  return at;
};

/** Move `position` out of the leaf and inline elements it opens. */
const beforeOpens = ({ edited, schema }: Context, position: number) => {
  let at = position;

  while (lineAt(edited, schema, at)?.within.at(-1)?.from === at - 1) at -= 1;

  return at;
};

/**
 * The tokens of `[from, to)` of `line` the step restores, with the leaf and
 * inline elements `from` starts inside opened and those `to` ends inside
 * closed.
 */
const restoredOf = (
  { after, readAfter }: Context,
  line: IndexedNodeRange,
  from: number,
  to: number
): Part => {
  let start = from;
  let end = to;

  while (start < end && readAfter.at(start)?.kind === 'close') start += 1;
  while (end > start && readAfter.at(end - 1)?.kind === 'open') end -= 1;

  const within = (position: number) =>
    insideOf(after, position).filter((entry) => entry.from > line.from);
  const opens = opensOf(after, within(start));
  const closes = closesOf(within(end));
  const tokens: JsonToken[] = [...opens];
  const origins: Array<number | null> = opens.map(() => null);

  for (let position = start; position < end; position++) {
    tokens.push(readAfter.at(position) ?? refuse('A token is out of reach.'));
    origins.push(position);
  }

  return made([...tokens, ...closes], [...origins, ...closes.map(() => null)]);
};

type Held = Readonly<
  { kind: 'brought' } | { kind: 'gone' } | { at: number; kind: 'held' }
>;

const enteredOf = (
  context: Context,
  cutLine: Line,
  landed: Line,
  span: Readonly<{ end: number; land: number }> | null
) => {
  const { after, edited, editMap, readAfter, stepMap } = context;
  const deleted = deletedOf(context);
  const parts: Part[] = [];
  const brought: IndexedNodeRange[] = [];
  const kept: IndexedNodeRange[] = [];
  let cursor = span?.end ?? null;
  let start = cutLine.line.to;
  let depth = 0;
  const heldAt = (entry: IndexedNodeRange): Held => {
    const source = stepMap.source(entry.from);

    if (source === null) return { kind: 'brought' };

    const at = editMap.target(source);

    return at === null ? { kind: 'gone' } : { at, kind: 'held' };
  };
  const copy = (to: number) => {
    const from =
      cursor !== null && to >= cursor
        ? cursor
        : refuse('The landed line sits in an element the edit moved.');
    let gone = false;

    for (let at = from; at < to && !gone; at++) gone = deleted(at);
    if (gone) parts.push(...keptRunsOf(withoutDeleted(context, from, to)));
    else if (to > from) parts.push({ from, kept: true, kind: 'copy', to });
    cursor = to;
  };
  const ownedByCopy = (position: number) => {
    const node =
      readAfter.at(position)?.kind === 'open'
        ? after.nodeStartingAt(position)
        : null;
    const source = node ? stepMap.source(node.from) : null;

    if (!node || source === null) return null;
    for (let at = node.from + 1; at < node.to; at++) {
      if (stepMap.source(at) !== source + at - node.from) return null;
    }

    return node.to;
  };
  const nodes = (to: number) => {
    const tokens: JsonToken[] = [];
    const origins: number[] = [];

    for (let position = start; position < to; position++) {
      const skip = ownedByCopy(position);

      if (skip !== null && skip <= to) {
        position = skip - 1;
        continue;
      }
      tokens.push(readAfter.at(position) ?? refuse('A token is out of reach.'));
      origins.push(position);
    }
    if (tokens.length > 0) parts.push(made(tokens, origins));
    start = to + 1;
  };

  const holders = new Set(
    landed.ancestors.flatMap((entry) => {
      const held = heldAt(entry);

      return held.kind === 'held' ? [held.at] : [];
    })
  );
  const leaveWrapped = () => {
    if (cursor === null) return;

    const around = insideOf(edited, cursor).filter(
      (entry) => entry.kind === 'element'
    );
    const [wrapper] = around.slice(
      around.findLastIndex((entry) => holders.has(entry.from)) + 1
    );

    if (!wrapper) return;
    if (
      edited
        .slice(cursor, wrapper.to)
        .tokens.some((token) => token.kind !== 'close')
    ) {
      refuse('The edit wrapped the elements the restored line leaves.');
    }
    copy(wrapper.to);
  };
  const closing = new Map(
    cutLine.ancestors.map((entry) => [entry.to - 1, entry])
  );
  const opening = new Map(landed.ancestors.map((entry) => [entry.from, entry]));

  for (let position = start; position < landed.line.from; position++) {
    const token = readAfter.at(position) ?? refuse('A token is out of reach.');

    if (token.kind === 'close' && depth === 0) {
      const closed =
        closing.get(position) ??
        refuse('The step restores nodes between its lines at another depth.');
      const held = heldAt(closed);
      const node = held.kind === 'held' ? edited.nodeStartingAt(held.at) : null;

      if (cursor !== null && node && node.to - 1 >= cursor) {
        copy(node.to - 1);
        nodes(position);
        copy(node.to);
      } else nodes(position);
    } else if (token.kind === 'close') {
      depth -= 1;
    } else if (token.kind === 'open') {
      const entry = depth === 0 ? opening.get(position) : undefined;

      if (!entry) {
        depth += 1;
        continue;
      }
      if (span && cursor !== null && cursor < span.land) copy(span.land);

      const held = heldAt(entry);

      if (held.kind === 'brought') leaveWrapped();
      nodes(position);
      if (held.kind === 'brought') {
        parts.push(made(opensOf(after, [entry]), [entry.from]));
        brought.push(entry);
      } else if (held.kind === 'held') {
        if (brought.length > 0) {
          refuse('The landed line sits in an element the edit moved.');
        }
        copy(held.at + 1);
        kept.push(entry);
      }
    }
  }
  if (depth !== 0) {
    refuse('The step restores nodes between its lines at another depth.');
  }
  leaveWrapped();
  nodes(landed.line.from);
  if (span && cursor !== null && cursor < span.land) copy(span.land);

  return {
    closes: made(
      closesOf(brought),
      brought.toReversed().map((entry) => entry.to - 1)
    ),
    nodes: [...kept, ...brought].map((entry) => after.node(entry.path)),
    parts,
    to: cursor,
  };
};

/**
 * An undo of a merge: the run leaves the line it was merged into for the line
 * the step restores after the elements whose closes it crossed.
 */
const forwardParts = (context: Context, sourceLine: Line): Built => {
  const { after, edited, editMap, items, read, schema, shape, stepMap } =
    context;
  const lastHead = items.findLast((item) => item.side === 'head');
  const firstRun = items.find((item) => item.side === 'run');

  if (lastHead && firstRun && lastHead.to > firstRun.from) {
    refuse('A letter the step keeps follows the run.');
  }

  // What the step restores before the cut and at the start of its new line.
  const kept = stepMap.target(shape.source - 1);
  const cutAfter =
    kept === null
      ? (stepMap.sections.findLast((section) => section.from < shape.source)
          ?.at ?? refuse('The step restores nothing before the run.'))
      : kept + 1;
  const lineAfter =
    lineAt(after, schema, cutAfter) ?? refuse('The cut is outside a line.');
  const landedAfter =
    lineAt(after, schema, shape.landing) ??
    refuse('The run lands outside a line.');
  const restoredLeft = restoredOf(
    context,
    lineAfter.line,
    cutAfter,
    lineAfter.line.to - 1
  );
  const restoredRight = restoredOf(
    context,
    landedAfter.line,
    landedAfter.line.contentFrom,
    shape.landing
  );
  const openLine = made(
    [openToken('element', propsOf(after, landedAfter.line))],
    [landedAfter.line.from]
  );
  const closeLine = made([closeToken('element')], [lineAfter.line.to - 1]);
  let cut: number;

  if (lastHead) {
    cut = pastCloses(context, lastHead.to, firstRun?.from ?? read.to);
  } else if (firstRun) {
    cut = beforeOpens(context, firstRun.from);
  } else {
    const opened = editMap.target(sourceLine.line.from);
    const line = opened === null ? null : edited.nodeStartingAt(opened);

    cut = line ? line.to - 1 : read.to;
  }

  const lineA = lineAt(edited, schema, cut);

  if (!lineA) {
    const entered = enteredOf(context, lineAfter, landedAfter, null);

    // No line is left to cut, so both lines come back whole.
    return {
      from: cut,
      parts: [
        made(
          [openToken('element', propsOf(after, lineAfter.line))],
          [lineAfter.line.from]
        ),
        restoredLeft,
        closeLine,
        ...entered.parts,
        openLine,
        restoredRight,
        { from: cut, kept: false, kind: 'copy', run: true, to: cut },
        made([closeToken('element')]),
        entered.closes,
      ],
      to: cut,
    };
  }

  const end = runEnd(context, lineA.line.to);
  const below = lineA.within.length + 1;
  const moved = depthOf(read, cut, end);

  if (moved.depth !== -below || moved.lowest < -below) {
    refuse('The run does not end with its lines.');
  }

  const crossedFrom = sourceLine.ancestors.findIndex(
    (entry) => entry.to === shape.landingBefore
  );
  const holder = crossedFrom > 0 ? sourceLine.ancestors[crossedFrom - 1] : null;
  const holderAt = holder
    ? lineA.ancestors.findIndex(
        (entry) => entry.from === editMap.target(holder.from)
      )
    : -1;

  if (holder && holderAt === -1) {
    refuse('The line left the element it lands in.');
  }

  const outer =
    crossedFrom === -1 || holderAt === lineA.ancestors.length - 1
      ? -1
      : holderAt + 1;
  const split = outer === -1 ? [] : lineA.ancestors.slice(outer + 1);
  const land = outer === -1 ? end : lineA.ancestors[outer].to;

  if (outer !== -1 && depthOf(read, end, land).depth !== -(split.length + 1)) {
    refuse('The run crosses elements the step did not cross.');
  }
  countCoreWork('carriedLines', 2 + split.length);

  const landedIn =
    outer === -1 ? lineA.ancestors : lineA.ancestors.slice(0, outer);
  const entered = enteredOf(context, lineAfter, landedAfter, { end, land });

  return {
    from: cut,
    parts: [
      made(closesOf(lineA.within)),
      restoredLeft,
      closeLine,
      ...entered.parts,
      openLine,
      restoredRight,
      made(
        pieceOpensOf(context, lineA.within, [
          after.node(landedAfter.line.path),
          ...entered.nodes.toReversed(),
          ...landedIn.toReversed().map((entry) => edited.node(entry.path)),
        ])
      ),
      { from: cut, kept: false, kind: 'copy', run: true, to: end },
      entered.closes,
    ],
    to: entered.to ?? land,
  };
};

/**
 * A redo of a merge: the run leaves its line, whose head the step deletes,
 * for the end of what the step keeps of the line it merges into.
 */
const backwardParts = (context: Context, landingLine: Line): Built => {
  const { edited, editMap, items, read, schema, shape } = context;
  const lastHead = items.findLast((item) => item.side === 'head');
  const firstRun = items.find((item) => item.side === 'run');
  let landing: number;

  if (lastHead) {
    landing = lastHead.to;
  } else {
    const opened = editMap.target(landingLine.line.from);
    const line = opened === null ? null : edited.nodeStartingAt(opened);

    landing = line?.contentFrom ?? refuse('The line the run lands in is gone.');
  }

  // The run starts at its first token the edit kept; what the edit typed
  // before that token in the run's line joins the merge as it stands.
  let cut: number | null = null;

  for (
    let position = shape.source;
    cut === null && position < shape.end;
    position++
  ) {
    cut = editMap.target(position);
  }

  // Letters the edit typed where the step deletes stay at the merge.
  const survivors = (from: number, to: number) =>
    leavesOf(
      edited,
      read,
      from,
      to,
      (position) => editMap.source(position) === null,
      () => null
    );

  if (cut === null && !firstRun) {
    // The edit took the run's line away, so the step only deletes what it
    // deletes of the line it merges into, and the run stays as a point.
    const line =
      lineAt(edited, schema, landing) ??
      refuse('The run lands outside a line.');
    const close = line.line.to - 1;

    countCoreWork('carriedLines', 1);

    return {
      from: landing,
      parts: [
        made(closesOf(line.within)),
        survivors(landing, close),
        { from: close, kept: false, kind: 'copy', run: true, to: close },
      ],
      to: close,
    };
  }

  const start =
    cut ??
    (firstRun
      ? beforeOpens(context, firstRun.from)
      : refuse('The run is gone.'));

  landing = pastCloses(context, landing, start);

  const lineA =
    lineAt(edited, schema, landing) ?? refuse('The run lands outside a line.');
  const lineB =
    lineAt(edited, schema, start) ?? refuse('The run starts outside a line.');

  if (lineB.line.from < lineA.line.to) {
    refuse('The edit joined the lines the step merges.');
  }
  if (
    items.some(
      (item) =>
        (item.side === 'head' && item.to > landing) ||
        (item.side === 'lead' && item.from >= start)
    )
  ) {
    refuse('The letters around the run are out of order.');
  }

  const end = runEnd(context, lineB.line.to);
  const below = lineB.within.length + 1;
  const moved = depthOf(read, start, end);

  if (moved.depth !== -below || moved.lowest < -below) {
    refuse('The run does not end with its lines.');
  }

  countCoreWork('carriedLines', 2);

  const between = withDeletedClosed(
    context,
    withoutDeleted(context, lineA.line.to, lineB.line.from),
    end
  );

  return {
    from: landing,
    parts: [
      made(closesOf(lineA.within)),
      survivors(landing, lineA.line.to),
      survivors(lineB.line.from, start),
      made(opensOf(edited, lineB.within)),
      { from: start, kept: false, kind: 'copy', run: true, to: end },
      between.part,
    ],
    to: between.to,
  };
};

const deletedOf =
  ({ editMap, stepMap }: Context) =>
  (position: number) => {
    const source = editMap.source(position);

    return source !== null && stepMap.target(source) === null;
  };

const withoutDeleted = (context: Context, from: number, to: number) => {
  const { originOf, read } = context;
  const tokens: JsonToken[] = [];
  const origins: Array<number | null> = [];
  const positions: number[] = [];
  const opened: Array<{ at: number; deleted: boolean; shrunk: boolean }> = [];
  const deleted = deletedOf(context);
  const shrinkParent = () => {
    const parent = opened.at(-1);

    if (parent) parent.shrunk = true;
  };

  for (let position = from; position < to; position++) {
    const token = read.at(position) ?? refuse('A token is out of reach.');

    if (token.kind === 'text' && deleted(position)) {
      shrinkParent();
      continue;
    }
    if (token.kind === 'open') {
      const gone = deleted(position);

      opened.push({ at: tokens.length, deleted: gone, shrunk: gone });
    } else if (token.kind === 'close') {
      const open = opened.pop();

      if (
        open &&
        (open.shrunk || deleted(position)) &&
        tokens.length === open.at + 1
      ) {
        tokens.length = open.at;
        origins.length = open.at;
        positions.length = open.at;
        shrinkParent();
        continue;
      }
    }
    tokens.push(token);
    origins.push(originOf(position));
    positions.push(position);
  }

  return { opened, origins, positions, tokens };
};

const keptRunsOf = ({
  positions,
}: Readonly<{ positions: readonly number[] }>): Part[] => {
  const runs: Part[] = [];
  let from = positions[0];

  for (let index = 1; index <= positions.length; index++) {
    if (positions[index] === positions[index - 1] + 1) continue;
    runs.push({ from, kept: true, kind: 'copy', to: positions[index - 1] + 1 });
    from = positions[index];
  }

  return positions.length === 0 ? [] : runs;
};

const withDeletedClosed = (
  context: Context,
  { opened, origins, tokens }: ReturnType<typeof withoutDeleted>,
  end: number
) => {
  const deleted = deletedOf(context);
  const closes: JsonToken[] = [];
  const closeOrigins: Array<number | null> = [];
  let through = end;

  for (let open = opened.pop(); open; open = opened.pop()) {
    const close = context.read.at(through);

    if (
      tokens.length !== open.at + 1 + closes.length ||
      close?.kind !== 'close'
    ) {
      break;
    }
    if (open.deleted && deleted(through)) {
      tokens.splice(open.at, 1);
      origins.splice(open.at, 1);
    } else if (!open.deleted && !deleted(through)) {
      closes.push(close);
      closeOrigins.push(context.originOf(through));
    } else {
      break;
    }
    through += 1;
  }

  return {
    part: made([...tokens, ...closes], [...origins, ...closeOrigins]),
    to: through,
  };
};

/**
 * Source tokens kept as target tokens, or one source open whose properties
 * the edit modified into the target open's.
 */
export type Match = Readonly<{ source: number; target: number }> &
  (
    | Readonly<{ length: number; modifications?: undefined }>
    | Readonly<{
        length: 1;
        modifications: readonly PropertyModification[];
      }>
  );

/** The matches that keep their order, each whole or not at all. */
const increasing = (matches: readonly Match[]) => {
  const kept: Match[] = [];
  let source = 0;

  for (const match of matches) {
    if (match.source >= source) {
      kept.push(match);
      source = match.source + match.length;
    }
  }

  return kept;
};

/** Add the change from `length` source tokens to `target` keeping `matches`. */
export const addMatched = (
  sections: number[],
  data: SectionData[],
  length: number,
  target: Readonly<{
    length: number;
    slice: (from: number, to?: number) => PreparedTokenSlice;
  }>,
  matches: readonly Match[]
) => {
  let source = 0;
  let at = 0;

  for (const match of increasing(matches)) {
    if (match.source > source || match.target > at) {
      addSection(
        sections,
        data,
        match.source - source,
        match.target - at,
        target.slice(at, match.target)
      );
    }
    if (match.modifications) {
      addSection(sections, data, 1, -2, match.modifications);
    } else addSection(sections, data, match.length, -1, null);
    source = match.source + match.length;
    at = match.target + match.length;
  }
  if (length > source || target.length > at) {
    addSection(
      sections,
      data,
      length - source,
      target.length - at,
      target.slice(at)
    );
  }
};

const addAll = (
  sections: number[],
  data: SectionData[],
  list: readonly Section[]
) => {
  for (const section of list) {
    addSection(sections, data, section.length, section.inserted, section.data);
  }
};

export const sameToken = (
  left: JsonToken | undefined,
  right: JsonToken | undefined
) => {
  if (!left || !right || left.kind !== right.kind) return false;
  if (left.kind === 'text') {
    return right.kind === 'text' && left.text === right.text;
  }
  if (left.kind === 'close') {
    return right.kind === 'close' && left.nodeKind === right.nodeKind;
  }

  return (
    right.kind === 'open' &&
    left.nodeKind === right.nodeKind &&
    jsonEqual(left.props, right.props)
  );
};

const addMatch = (matches: Match[], source: number, target: number) => {
  const last = matches.at(-1);

  if (
    last &&
    !last.modifications &&
    last.target + last.length === target &&
    last.source + last.length === source
  ) {
    matches[matches.length - 1] = {
      length: last.length + 1,
      source: last.source,
      target: last.target,
    };
  } else {
    matches.push({ length: 1, source, target });
  }
};

const assemble = ({
  edited,
  editMap,
  originOf,
  parts,
  read,
  readAfter,
  region,
  root,
  grown,
  unplaced,
}: Readonly<{
  edited: DocumentIndex;
  editMap: Correspondence;
  originOf: (position: number) => number | null;
  parts: readonly Part[];
  read: Tokens;
  readAfter: Tokens;
  region: Region;
  root: string;
  grown: number;
  /** Letters of `after` the letter map gives no place. */
  unplaced: ReadonlySet<number>;
}>): CarriedProjection => {
  const slices: PreparedTokenSlice[] = [];
  const stepMatches: Match[] = [];
  const restMatches: Match[] = [];
  const letters = new Map<number, number>();
  let position = 0;
  let run: CarriedRun | null = null;
  // `editedAt` is where the token stands in the edited document, so a token
  // whose properties the edit modified matches as that modification.
  const matchRest = (
    target: number,
    origin: number | null,
    token: JsonToken | undefined,
    editedAt: number | null
  ) => {
    if (origin === null) return;

    const kept = readAfter.at(origin);

    if (!sameToken(token, kept)) {
      const input = editedAt === null ? null : editMap.source(editedAt);
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
          token
        )
      ) {
        restMatches.push({
          length: 1,
          modifications,
          source: origin - region.from,
          target,
        });
      }

      return;
    }
    if (token?.kind === 'text' && !unplaced.has(origin)) {
      letters.set(origin, region.editedFrom + target);
    }

    addMatch(restMatches, origin - region.from, target);
  };

  for (const part of parts) {
    if (part.kind === 'make') {
      if (part.run && !run) {
        run = {
          at: region.editedFrom + position + part.run.from,
          landed: part.run.to - part.run.from,
          length: part.run.length,
          root,
          source: part.run.source,
        };
      }

      let offset = 0;

      part.tokens.forEach((token, index) => {
        const kept = part.keptAt?.[index] ?? null;

        matchRest(position + offset, part.origins[index], token, kept);
        if (kept !== null) {
          addMatch(stepMatches, kept - region.editedFrom, position + offset);
        }
        offset += token.kind === 'text' ? token.text.length : 1;
      });

      const slice = PreparedTokenSlice.fromTokens(part.tokens);

      slices.push(slice);
      position += slice.length;
      continue;
    }
    if (part.to < part.from) refuse('A part runs backward.');
    if (part.run && !run) {
      run = {
        at: region.editedFrom + position,
        landed: part.to - part.from,
        length: part.to - part.from,
        root,
        source: part.from,
      };
    }
    if (part.to === part.from) continue;
    slices.push(edited.slice(part.from, part.to));
    if (part.kept) {
      stepMatches.push({
        length: part.to - part.from,
        source: part.from - region.editedFrom,
        target: position,
      });
    }
    for (let at = part.from; at < part.to; at++) {
      matchRest(position + at - part.from, originOf(at), read.at(at), at);
    }
    position += part.to - part.from;
  }

  const target = PreparedTokenSlice.concat(slices);
  const stepSections: number[] = [];
  const stepData: SectionData[] = [];

  addSection(stepSections, stepData, region.editedFrom, -1, null);
  addMatched(
    stepSections,
    stepData,
    region.editedTo - region.editedFrom,
    target,
    stepMatches
  );
  addSection(stepSections, stepData, edited.length - region.editedTo, -1, null);

  const restSections: number[] = [];
  const restData: SectionData[] = [];

  addAll(restSections, restData, region.leading);
  addMatched(
    restSections,
    restData,
    region.to + grown - region.from,
    target,
    restMatches
  );
  addAll(restSections, restData, region.trailing);

  const rest = RootChange.fromSections(restSections, restData);

  return {
    letterAt: (origin) => {
      if (unplaced.has(origin)) return null;
      if (origin >= region.from && origin < region.to + grown) {
        return letters.get(origin) ?? null;
      }

      const kept = editMap.target(
        origin < region.from ? origin : origin - grown
      );

      if (kept === null) return undefined;
      if (kept < region.editedFrom) return kept;

      return kept >= region.editedTo
        ? kept + position - (region.editedTo - region.editedFrom)
        : undefined;
    },
    rest,
    runs: run ? [run] : [],
    step: RootChange.fromSections(stepSections, stepData),
  };
};
