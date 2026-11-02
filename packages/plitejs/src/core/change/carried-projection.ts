import { countCoreWork } from '../work';
import type { CarriedRun } from './carried-run';
import type { DocumentIndex, IndexedNodeRange } from './document-index';
import { jsonEqual, type JsonRecord } from './json';
import {
  addSection,
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

/**
 * A step that moves a run of tokens, mapped through an outside edit by the
 * letters the edit kept instead of by position.
 *
 * - Input: the step `step` on `before` with its runs, the document `after` it
 *   gives, and the edit `edit` from `before` to `edited`.
 * - Correspondence: each token the edit kept or moved exactly, found through
 *   its kept sections and its exact move, never by equal values.
 * - Placement: content the edit inserted goes with the first letter it
 *   replaced, or else with the kept letter before it in its line, or with the
 *   one after it when the step deletes that one; content inserted where a run
 *   holds no letter goes with the run.
 * - Output: `step` mapped onto `edited`, and `rest`, the change from `after`
 *   to the same result, both written from one assembled document.
 */
export type CarriedProjectionInput = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  edit: RootChange;
  edited: DocumentIndex;
  root: string;
  runs: readonly CarriedRun[];
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

export type CarriedProjection = Readonly<{
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

const outputOf = (section: Section) =>
  section.inserted < 0 ? section.length : section.inserted;

type Move = Readonly<{
  deletion: Section;
  insertion: Section;
}>;

/** The node an edit deletes and inserts again whole, read as one move. */
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
    ? { deletion, insertion }
    : null;
};

/** The tokens a change keeps or moves exactly, from each side to the other. */
class Correspondence {
  readonly move: Move | null;
  readonly sections: readonly Section[];

  constructor(change: RootChange, before: DocumentIndex) {
    this.sections = sectionsOf(change);
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

    const { move } = this;

    return move &&
      move.deletion.from <= position &&
      position < move.deletion.from + move.deletion.length
      ? move.insertion.at + position - move.deletion.from
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

  /** The sections that delete or insert, other than an exact move. */
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
class Tokens {
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

const propsOf = (index: DocumentIndex, entry: IndexedNodeRange) => {
  const [token] = index.slice(entry.from, entry.from + 1).tokens;

  return token?.kind === 'open' ? token.props : {};
};

type Line = Readonly<{
  line: IndexedNodeRange;
  /** Its ancestors, outermost first. */
  ancestors: readonly IndexedNodeRange[];
  /** The leaf and inline elements around the position, outermost first. */
  within: readonly IndexedNodeRange[];
}>;

const lineAt = (
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

const closesOf = (entries: readonly IndexedNodeRange[]) =>
  entries.toReversed().map((entry) => closeToken(entry.kind));

const opensOf = (index: DocumentIndex, entries: readonly IndexedNodeRange[]) =>
  entries.map((entry) => openToken(entry.kind, propsOf(index, entry)));

const pieceOpensOf = (
  { edited, root, schema }: Context,
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

/**
 * Whether `edit` reaches the run: it deletes a token of it, inserts from its
 * first token up to its last or where it holds no letter, or writes
 * properties on a node that holds its letters.
 */
export const touchesCarriedRuns = (input: CarriedProjectionInput) => {
  const shape = shapeOf(input);
  const edit = new Correspondence(input.edit, input.before);
  const holders =
    shape.letter === null ? [] : insideOf(input.before, shape.letter);
  const deletes = sectionsOf(input.step).filter(
    (section) => section.inserted >= 0 && section.length > 0
  );
  const writes = edit.sections.some((section) => {
    const end = section.from + section.length;

    if (section.inserted === -1) return false;
    if (section.from < shape.end && end > shape.source) return true;
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

/** Map a step that carries a run through `edit` by the letters it kept. */
export const projectCarriedStep = (
  input: CarriedProjectionInput
): CarriedProjection => {
  const { after, before, edit, edited, schema, step } = input;
  const shape = shapeOf(input);
  const stepMap = new Correspondence(step, before);
  const editMap = new Correspondence(edit, before);
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

  const region = regionOf(
    editMap,
    Math.min(lines.from, changedFrom),
    Math.max(lines.to, changedTo, shape.landingBefore),
    before.length,
    (position) => lineAt(before, schema, position)?.line ?? null
  );
  const grown = step.newLength - step.length;
  const read = new Tokens(edited, region.editedFrom, region.editedTo);
  const readBefore = new Tokens(before, region.from, region.to);
  const readAfter = new Tokens(after, region.from, region.to + grown);
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
  const originOf = (position: number) => {
    const source = editMap.source(position);

    if (source === null) return null;
    if (shape.source <= source && source < shape.end) {
      return shape.landing + source - shape.source;
    }

    return stepMap.target(source);
  };
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

  return assemble({
    edited,
    originOf,
    parts: [
      { from: region.editedFrom, kept: true, kind: 'copy', to: built.from },
      ...built.parts,
      { from: built.to, kept: true, kind: 'copy', to: region.editedTo },
    ],
    read,
    readAfter,
    region,
    root: input.root,
    grown,
  });
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

/**
 * The whole nodes the step restores between `from` and `to`, past the closes
 * that `from` starts with and before the opens `to` ends with.
 */
const betweenOf = ({ readAfter }: Context, from: number, to: number) => {
  let start = from;
  let end = to;

  while (start < end && readAfter.at(start)?.kind === 'close') start += 1;
  while (end > start && readAfter.at(end - 1)?.kind === 'open') end -= 1;

  const { depth, lowest } = depthOf(readAfter, start, end);

  if (depth !== 0 || lowest < 0) {
    refuse('The step restores nodes between its lines at another depth.');
  }

  const tokens: JsonToken[] = [];
  const origins: number[] = [];

  for (let position = start; position < end; position++) {
    tokens.push(readAfter.at(position) ?? refuse('A token is out of reach.'));
    origins.push(position);
  }

  return made(tokens, origins);
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
  const between = betweenOf(context, lineAfter.line.to, landedAfter.line.from);
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
        between,
        openLine,
        restoredRight,
        { from: cut, kept: false, kind: 'copy', run: true, to: cut },
        made([closeToken('element')]),
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

  return {
    from: cut,
    parts: [
      made(closesOf(lineA.within)),
      restoredLeft,
      closeLine,
      { from: end, kept: true, kind: 'copy', to: land },
      between,
      openLine,
      restoredRight,
      made(
        pieceOpensOf(context, lineA.within, [
          after.node(landedAfter.line.path),
          ...landedIn.toReversed().map((entry) => edited.node(entry.path)),
        ])
      ),
      { from: cut, kept: false, kind: 'copy', run: true, to: end },
    ],
    to: land,
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

  return {
    from: landing,
    parts: [
      made(closesOf(lineA.within)),
      survivors(landing, lineA.line.to),
      survivors(lineB.line.from, start),
      made(opensOf(edited, lineB.within)),
      { from: start, kept: false, kind: 'copy', run: true, to: end },
      withoutDeleted(context, lineA.line.to, lineB.line.from),
    ],
    to: end,
  };
};

const withoutDeleted = (
  { editMap, originOf, read, stepMap }: Context,
  from: number,
  to: number
): Part => {
  const tokens: JsonToken[] = [];
  const origins: Array<number | null> = [];
  const opened: Array<{ at: number; shrunk: boolean }> = [];
  const deleted = (position: number) => {
    const source = editMap.source(position);

    return source !== null && stepMap.target(source) === null;
  };
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
      opened.push({ at: tokens.length, shrunk: deleted(position) });
    } else if (token.kind === 'close') {
      const open = opened.pop();

      if (
        open &&
        (open.shrunk || deleted(position)) &&
        tokens.length === open.at + 1
      ) {
        tokens.length = open.at;
        origins.length = open.at;
        shrinkParent();
        continue;
      }
    }
    tokens.push(token);
    origins.push(originOf(position));
  }

  return made(tokens, origins);
};

type Match = Readonly<{ source: number; target: number; length: number }>;

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
const addMatched = (
  sections: number[],
  data: SectionData[],
  length: number,
  target: PreparedTokenSlice,
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
    addSection(sections, data, match.length, -1, null);
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

const sameToken = (
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

const assemble = ({
  edited,
  originOf,
  parts,
  read,
  readAfter,
  region,
  root,
  grown,
}: Readonly<{
  edited: DocumentIndex;
  originOf: (position: number) => number | null;
  parts: readonly Part[];
  read: Tokens;
  readAfter: Tokens;
  region: Region;
  root: string;
  grown: number;
}>): CarriedProjection => {
  const slices: PreparedTokenSlice[] = [];
  const stepMatches: Match[] = [];
  const restMatches: Match[] = [];
  let position = 0;
  let run: CarriedRun | null = null;
  const matchRest = (
    target: number,
    origin: number | null,
    token?: JsonToken
  ) => {
    if (origin === null || !sameToken(token, readAfter.at(origin))) return;

    const source = origin - region.from;
    const last = restMatches.at(-1);

    if (
      last &&
      last.target + last.length === target &&
      last.source + last.length === source
    ) {
      restMatches[restMatches.length - 1] = {
        ...last,
        length: last.length + 1,
      };
    } else {
      restMatches.push({ length: 1, source, target });
    }
  };

  for (const part of parts) {
    if (part.kind === 'make') {
      let offset = 0;

      part.tokens.forEach((token, index) => {
        matchRest(position + offset, part.origins[index], token);
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
      matchRest(position + at - part.from, originOf(at), read.at(at));
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

  return {
    rest: RootChange.fromSections(restSections, restData),
    runs: [run ?? refuse('The run has no place.')],
    step: RootChange.fromSections(stepSections, stepData),
  };
};
