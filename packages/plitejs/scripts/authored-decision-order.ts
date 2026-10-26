import { writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { isDeepStrictEqual } from 'node:util';

import {
  enforceBaseline,
  readBaseline,
} from '../../../tooling/scripts/finding-baseline.mjs';
import { expandContexts } from '../src/authored/facts/compact';
import {
  type LandedRecord,
  LANDED as LANDED_RECORDS,
  parseLanded,
  RESERVES,
  VERDICTS,
} from '../src/authored/facts/records';
import type { AuthoredMark, AuthoredMember } from '../src/authored/tree/marks';
import type { JsonNode } from '../src/core/change/tokens';
import { recordsOf, reviewRecords } from '../test/support/authored';
import {
  admissionOf,
  all,
  type Block2,
  decideIn,
  decisionAdmission,
  EDITING,
  type GivebackOp,
  givebackEditor,
  givebackRead,
  givebackStart,
  generatedQuotes,
  ID_PLACES,
  type IdPlaces,
  LANDED,
  type LinkHalf,
  quotesEditor,
  quotesSchema,
  recordGiveback,
  resolveWithVerdicts,
  settleAsAdmission,
  loadWithVerdicts,
  type Verdict,
  idGeneratorCalls,
  withCuts,
  withMarksOf,
  writesOf,
} from '../test/support/authored-laws';

const BASELINE =
  'packages/plitejs/scripts/authored-decision-order-baseline.json';
const RULE = 'decision-order';
const TOGETHER = 'decided-together';
const OWNER = 'packages/plitejs/src/authored/tree/resolve.ts';
const GIVEBACK_RULE = 'giveback-decision-order';
const GIVEBACK_TOGETHER = 'giveback-decided-together';
const GIVEBACK_OWNER = 'packages/plitejs/src/authored/tree/cuts.ts';
const GATE = { blocks: 2, changes: 2, marks: 2 };
const GIVEBACK_GATE = { changes: 2, edits: 0, ops: 3 };
const FAMILIES = ['giveback', 'quotes'] as const;

type Option =
  | 'align'
  | 'align-center'
  | 'delete'
  | 'delete-spare'
  | 'insert'
  | 'join'
  | 'move'
  | 'move-in'
  | 'retype'
  | 'split'
  | 'unwrap'
  | 'wrap';
type Choice = { change: string; option: Option } | undefined;
type Node = {
  align?: string;
  authored?: AuthoredMember[];
  childRoots?: Readonly<Record<string, string>>;
  children?: Node[];
  id?: string;
  text?: string;
  type?: string;
};
type Failure = { detail: string; identity: string };
type Family = (typeof FAMILIES)[number];

const BOUNDARY: readonly Option[] = ['join', 'split'];
const CONTENT: readonly Option[] = ['delete', 'insert'];
// A suggested move strikes the block and inserts a copy under the same
// change. The struck block keeps its id, so the copy stores a fresh one and
// shows the original's through an `as` member, as the recorder writes it.
// `move` lands the copy after the last block and `move-in` as the last line
// of the last quote, so a quote's type tag sits above it.
const MOVABLE: readonly Option[] = [...CONTENT, 'move', 'move-in'];
// Another change can retype a copy into a heading or join it into the block
// before it.
const COPY_TYPE: readonly Option[] = ['retype'];
const COPY_BOUNDARY: readonly Option[] = ['join'];
// A deletion of a quote's content can store a spare that holds the value a
// copy of one of its lines shows.
const QUOTE_CONTENT: readonly Option[] = [...CONTENT, 'delete-spare'];
const ENCLOSURE: readonly Option[] = ['unwrap', 'wrap'];
const FORMAT: readonly Option[] = ['align', 'align-center'];
// A suggested retype of a section into the quote.
const QUOTE_FORMAT: readonly Option[] = [...FORMAT, 'retype'];

const stray = process.argv
  .slice(2)
  .filter(
    (arg) =>
      !/^--(?:(?:blocks|changes|family|giveback-changes|giveback-edits|giveback-ops|giveback-script|jobs|marks|schema|together)=.*|init|lower)$/.test(
        arg
      )
  );
if (stray.length > 0) {
  console.error(
    `Unknown arguments: ${stray.join(' ')}. A bound flag takes the form --marks=3.`
  );
  process.exit(2);
}

const flag = (name: string) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
const wholeFlag = (name: string, fallback: number, least = 1) => {
  const value = Number(flag(name) ?? fallback);
  if (!Number.isInteger(value) || value < least) {
    console.error(`--${name} takes a whole number of at least ${least}.`);
    process.exit(2);
  }
  return value;
};
const bound = {
  blocks: wholeFlag('blocks', GATE.blocks),
  changes: wholeFlag('changes', GATE.changes),
  marks: wholeFlag('marks', GATE.marks),
};
const givebackBound = {
  changes: wholeFlag('giveback-changes', GIVEBACK_GATE.changes),
  edits: wholeFlag('giveback-edits', GIVEBACK_GATE.edits, 0),
  ops: wholeFlag('giveback-ops', GIVEBACK_GATE.ops, 0),
};
if (givebackBound.edits > 1) {
  console.error('--giveback-edits takes 0 or 1.');
  process.exit(2);
}
const family = flag('family');
if (family !== undefined && !FAMILIES.includes(family as Family)) {
  console.error(`--family takes ${FAMILIES.join(' or ')}.`);
  process.exit(2);
}
const runs = (name: Family) => family === undefined || family === name;
const SCHEMAS = [
  'plain',
  'generated',
  ...ID_PLACES.map((places) => `generated-${places}`),
];
const schemaFlag = flag('schema') ?? 'plain';
if (!SCHEMAS.includes(schemaFlag)) {
  console.error(`--schema takes ${SCHEMAS.join(', ')}.`);
  process.exit(2);
}
// Each quotes run: the plain schema, or one variant for each place a
// generated id holds. `generated` runs every variant.
const schemas: ReadonlyArray<IdPlaces | null> =
  schemaFlag === 'plain'
    ? [null]
    : schemaFlag === 'generated'
      ? ID_PLACES
      : [schemaFlag.slice('generated-'.length) as IdPlaces];
// Takes a script's name as a failure prints it, to rerun that script alone
// within the bound.
const onlyScript = flag('giveback-script');
const atGate =
  family === undefined &&
  schemaFlag === 'plain' &&
  onlyScript === undefined &&
  isDeepStrictEqual(bound, GATE) &&
  isDeepStrictEqual(givebackBound, GIVEBACK_GATE);

// A block is a paragraph, a quote of one or two lines, or, under a generated
// id, a card whose body root holds one line.
const CARD = 3;

function* shapes(places: IdPlaces | null): Generator<number[]> {
  const kinds = places ? 4 : 3;
  for (let count = 1; count <= bound.blocks; count++) {
    for (let code = 0; code < kinds ** count; code++) {
      yield Array.from(
        { length: count },
        (_, index) => Math.floor(code / kinds ** index) % kinds
      );
    }
  }
}

// The places a recorded change can mark, in document order: a block's
// boundary with the block before it, its whole content, a quote's enclosure
// and format tag, and each line's one leaf. Under a generated id, a line's
// copy can also be retyped or joined by another change. A card takes no
// boundary, and neither does the block after it.
const slotsOf = (shape: readonly number[], places: IdPlaces | null) =>
  shape.flatMap((block, index) => {
    const boundary = index > 0 && shape[index - 1] !== CARD;
    const paragraph = (bounded: boolean) => [
      ...(bounded ? [BOUNDARY] : []),
      ...(places
        ? [MOVABLE, CONTENT, COPY_TYPE, COPY_BOUNDARY]
        : [CONTENT, CONTENT]),
    ];
    if (block === 0) return paragraph(boundary);
    if (block === CARD) return [CONTENT, ...paragraph(false)];
    return [
      ...(boundary ? [BOUNDARY] : []),
      places ? QUOTE_CONTENT : CONTENT,
      ENCLOSURE,
      places ? QUOTE_FORMAT : FORMAT,
      ...Array.from({ length: block }, (_, inner) =>
        paragraph(inner > 0)
      ).flat(),
    ];
  });

// Change names are labels, so only the first use of each new one is tried:
// s0 first, then s0 or s1, and so on.
function* pickings(
  slots: ReadonlyArray<readonly Option[]>,
  marks: number
): Generator<Choice[]> {
  const picks: Choice[] = [];
  function* fill(
    index: number,
    used: number,
    fresh: number
  ): Generator<Choice[]> {
    if (index === slots.length) {
      if (used === marks) yield [...picks];
      return;
    }
    if (slots.length - index > marks - used) {
      picks.push(undefined);
      yield* fill(index + 1, used, fresh);
      picks.pop();
    }
    if (used === marks) return;
    for (const option of slots[index]) {
      for (let at = 0; at <= Math.min(fresh, bound.changes - 1); at++) {
        picks.push({ change: `s${at}`, option });
        yield* fill(index + 1, used + 1, at === fresh ? fresh + 1 : fresh);
        picks.pop();
      }
    }
  }
  yield* fill(0, 0, 0);
}

const formatTag = (
  change: string,
  key: string,
  fields: Readonly<Record<string, unknown>>
) =>
  ({
    at: 1,
    author: change,
    change,
    id: `${key}0${change}`,
    key,
    kind: 'format',
    ...fields,
  }) as AuthoredMark;

const alignTag = (change: string) =>
  formatTag(change, 'align', { write: { kind: 'set', value: 'center' } });

// Whether a variant's generated id holds on an element of `type`. Under
// `placed`, a heading's id is not generated and a copy states its own.
const holdsId = (places: IdPlaces | null, type: string | undefined) =>
  places === 'elements' ||
  (places !== null &&
    (type === 'paragraph' ||
      (places !== 'paragraphs' && places !== 'placed' && type !== 'link')));

const insertedBy = (node: Node, change: string) =>
  node.authored?.some(
    (item) => item.change === change && item.kind === 'insert'
  ) ?? false;

type Doc = Readonly<{
  children: readonly Node[];
  roots?: Readonly<Record<string, readonly Node[]>>;
}>;
type Copy = Readonly<{
  join: Choice;
  move: NonNullable<Choice>;
  quote: number | null;
  retype: Choice;
  text: string;
}>;

const build = (
  shape: readonly number[],
  picks: readonly Choice[],
  places: IdPlaces | null
): Doc | null => {
  let cursor = 0;
  let letter = 0;
  const take = () => {
    const pick = picks[cursor];
    cursor += 1;
    return pick;
  };
  const next = () => {
    const pick = take();
    return (
      pick && { change: pick.change, kind: pick.option as AuthoredMark['kind'] }
    );
  };
  const moves: Copy[] = [];
  const roots: Record<string, Node[]> = {};
  let unrecorded = false;
  const paragraph = (bounded: boolean, quote: number | null) => {
    const boundary = bounded ? next() : undefined;
    const pick = take();
    const leaf = next();
    const retype = places ? take() : undefined;
    const join = places ? take() : undefined;
    const text = String.fromCharCode(97 + letter);
    letter += 1;
    const id = places ? { id: `p${text}` } : {};
    if (pick?.option === 'move' || pick?.option === 'move-in') {
      // The recorder writes no copy of a leaf another change marks, and a
      // change neither tags nor joins a copy it inserted.
      unrecorded ||=
        leaf !== undefined ||
        retype?.change === pick.change ||
        join?.change === pick.change;
      moves.push({ join, move: pick, quote, retype, text });
    } else {
      unrecorded ||= retype !== undefined || join !== undefined;
    }
    const content = pick && {
      change: pick.change,
      kind: (pick.option.startsWith('move')
        ? 'delete'
        : pick.option) as AuthoredMark['kind'],
    };
    return withMarksOf(
      { type: 'paragraph', ...id, children: [withMarksOf({ text }, [leaf])] },
      [boundary, content]
    );
  };

  const spares = new Map<number, string>();
  const blocks = shape.map((block, index): Node | null => {
    const bounded = index > 0 && shape[index - 1] !== CARD;
    if (block === 0) return paragraph(bounded, null);
    if (block === CARD) {
      const content = next();
      const root = `r${index}`;
      roots[root] = [paragraph(false, null)];
      return withMarksOf(
        {
          type: 'card',
          ...(holdsId(places, 'card') ? { id: `c${index}` } : {}),
          childRoots: { body: root },
          children: [{ text: 'C' }],
        },
        [content]
      );
    }
    const boundary = bounded ? next() : undefined;
    const contentPick = take();
    const content = contentPick && {
      change: contentPick.change,
      kind: (contentPick.option === 'delete-spare'
        ? 'delete'
        : contentPick.option) as AuthoredMark['kind'],
    };
    if (contentPick?.option === 'delete-spare') {
      spares.set(index, contentPick.change);
    }
    const enclosure = next();
    const format = take();
    const children = Array.from({ length: block }, (_, inner) =>
      paragraph(inner > 0, index)
    );
    const quote: Node = withMarksOf(
      {
        type: 'quote',
        ...(holdsId(places, 'quote') ? { id: `q${index}` } : {}),
        children,
      },
      [boundary, content, enclosure]
    );
    if (!format) return quote;
    if (insertedBy(quote, format.change)) return null;
    if (format.option === 'retype') {
      return {
        ...quote,
        authored: [
          ...(quote.authored ?? []),
          formatTag(format.change, 'type', {
            before: 'section',
            write: { kind: 'set', value: 'quote' },
          }),
        ],
      };
    }
    return {
      ...quote,
      ...(format.option === 'align-center' ? { align: 'center' } : {}),
      authored: [...(quote.authored ?? []), alignTag(format.change)],
    };
  });
  if (unrecorded || blocks.includes(null)) return null;

  const main = blocks as Node[];
  const last = main.findLastIndex((node) => node.type === 'quote');
  const landed: Node[] = [];
  for (const { join, move, quote, retype, text } of moves) {
    const inQuote = move.option === 'move-in';
    // A copy lands only in a quote no other change's content mark covers.
    if (inQuote && (last === -1 || main[last].authored?.some(marksContent))) {
      return null;
    }
    // Under `placed`, a copy its author moves into a quote is a heading, as
    // if they retyped their own insertion.
    const heading = retype !== undefined || (places === 'placed' && inQuote);
    const fresh = `m${text}`;
    const holds =
      places === 'placed' || holdsId(places, heading ? 'heading' : 'paragraph');
    const node: Node = withMarksOf(
      {
        type: heading ? 'heading' : 'paragraph',
        ...(holds ? { id: fresh } : {}),
        children: [{ text }],
      },
      [
        { change: move.change, kind: 'insert' },
        join && { change: join.change, kind: 'join' },
      ]
    );
    const copy: Node = {
      ...node,
      authored: [
        ...(node.authored ?? []),
        { kind: 'as', values: { id: `p${text}` } },
        ...(retype
          ? [
              formatTag(retype.change, 'type', {
                before: 'paragraph',
                write: { kind: 'set', value: 'heading' },
              }),
              ...(holds
                ? []
                : [
                    formatTag(retype.change, 'id', {
                      before: fresh,
                      write: { kind: 'remove' },
                    }),
                  ]),
            ]
          : []),
      ],
    };
    if (inQuote) {
      main[last] = {
        ...main[last],
        children: [...(main[last].children ?? []), copy],
      };
    } else {
      landed.push(copy);
    }
    for (const [index, change] of spares) {
      if (quote !== index) continue;
      main[index] = {
        ...main[index],
        authored: [
          ...(main[index].authored ?? []),
          {
            at: 1,
            author: change,
            change,
            kind: 'reserve',
            node: {
              children: [{ text: '' }],
              id: `p${text}`,
              type: 'paragraph',
            },
            slot: { min: 0 },
            type: 'quote',
          },
        ],
      };
      spares.delete(index);
    }
  }
  // A spare holds the value a copy of one of its quote's lines shows.
  if (spares.size > 0) return null;
  const children = [...main, ...landed];
  return Object.keys(roots).length > 0 ? { children, roots } : { children };
};

const marksContent = (item: AuthoredMember) =>
  item.kind === 'delete' || item.kind === 'insert';

// Links a cut adds get ids too where the variant holds one on every element.
const withIds = (nodes: readonly Node[], places: IdPlaces) => {
  let count = 0;
  const visit = (node: Node): Node =>
    node.text === undefined
      ? {
          ...node,
          ...(node.id || !holdsId(places, node.type)
            ? {}
            : { id: `n${(count += 1)}` }),
          children: node.children?.map(visit),
        }
      : node;
  return nodes.map(visit);
};

const cutFlags = (blocks: readonly Block2[]) =>
  blocks.reduce<boolean[][]>(
    (variants, block, index) =>
      index > 0 &&
      block.type === 'paragraph' &&
      blocks[index - 1].type === 'paragraph' &&
      block.authored?.some((item) => item.kind === 'split')
        ? variants.flatMap((flags) => [
            flags,
            flags.map((value, at) => at === index || value),
          ])
        : variants,
    [blocks.map(() => false)]
  );

const generate = (places: IdPlaces | null) => {
  const documents = new Map<string, Doc>();
  for (let marks = 1; marks <= bound.marks; marks++) {
    for (const shape of shapes(places)) {
      for (const picks of pickings(slotsOf(shape, places), marks)) {
        const built = build(shape, picks, places);
        if (!built) continue;
        for (const flags of cutFlags(built.children as Block2[])) {
          const cut = withCuts(built.children as Block2[], flags) as Node[];
          const document: Doc = places
            ? {
                ...built,
                children: withIds(cut, places),
              }
            : { ...built, children: cut };
          documents.set(JSON.stringify(document), document);
        }
      }
    }
  }
  return [...documents.values()];
};

const describe = (node: Node): string => {
  const marks = (node.authored ?? []).map((item) =>
    [
      item.kind === 'format' ? item.key : item.kind,
      item.change,
      (item as { side?: string }).side,
      item.kind === 'reserve' && item.built ? 'built' : undefined,
    ]
      .filter(Boolean)
      .join(' ')
  );
  const own = marks.length > 0 ? `{${marks.join(', ')}}` : '';
  if (node.text !== undefined) return `${JSON.stringify(node.text)}${own}`;
  const {
    authored: _marks,
    children = [],
    text: _text,
    type,
    ...stored
  } = node;
  const props = Object.entries(stored)
    .map(
      ([key, value]) =>
        `[${key} ${typeof value === 'string' ? value : JSON.stringify(value)}]`
    )
    .join('');
  return `${type}${props}${own}(${children.map(describe).join(' ')})`;
};
const story = (nodes: readonly unknown[]) =>
  (nodes as Node[]).map(describe).join(' ');
const storyOf = ({ children, roots = {} }: Doc) =>
  [
    story(children),
    ...Object.entries(roots).map(([root, nodes]) => `${root}: ${story(nodes)}`),
  ].join(' | ');

const kindsOf = (nodes: readonly Node[], change: string) => {
  const kinds = new Set<string>();
  const walk = (node: Node) => {
    for (const item of node.authored ?? []) {
      if (item.change === change) kinds.add(item.kind);
    }
    for (const child of node.children ?? []) walk(child);
  };
  for (const node of nodes) walk(node);
  return [...kinds];
};

const changesIn = ({ children, roots = {} }: Doc) => {
  const found = new Set<string>();
  const walk = (node: Node) => {
    for (const item of node.authored ?? []) {
      if (item.kind !== 'reserve' && item.kind !== 'as') {
        found.add(item.change);
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  for (const node of [...children, ...Object.values(roots).flat()]) walk(node);
  return [...found].sort();
};

/** Every root's spare records by id, as a document stores them. */
type StoredReserves = Readonly<Record<string, unknown>>;
type Loaded = Readonly<{
  children: readonly JsonNode[];
  reserves: StoredReserves;
  roots?: Readonly<Record<string, readonly JsonNode[]>>;
}>;
type QuotesEditor = typeof quotesEditor;

const editorFor = (places: IdPlaces | null): QuotesEditor =>
  places ? generatedQuotes[places].editor : quotesEditor;

// The document loading stores, with every root's spare records.
const normalize = (generated: Doc, editor: QuotesEditor) => {
  try {
    const value = editor(
      generated.roots ? generated : generated.children
    ).read.value();
    const { children, roots } = expandContexts(value);
    return JSON.stringify({
      children,
      reserves: recordsOf(value)[RESERVES] ?? {},
      ...(roots && Object.keys(roots).length > 0 ? { roots } : {}),
    });
  } catch {
    return null;
  }
};

type Outcome<State> =
  | Readonly<{ kind: 'refused'; reason: string }>
  | Readonly<{ kind: 'settled'; state: State }>
  | Readonly<{ kind: 'waits' }>;

/**
 * One document's decisions: `step` decides a set of verdicts in one call on
 * the state the earlier calls left, and `read` is what deciding in turn and
 * deciding at once must agree on.
 */
type Walk<State> = Readonly<{
  failures?: readonly Failure[];
  name: string;
  pending: readonly string[];
  read: (state: State) => Readonly<{ seen: unknown; shown: string }>;
  /**
   * A key two states share only when every later step gives both the same
   * outcome, so an order that reaches a state another order reached is not
   * walked again.
   */
  same?: (state: State) => string;
  start: State;
  step: (
    state: State,
    decided: ReadonlyMap<string, Verdict>,
    deciding: ReadonlyMap<string, Verdict>
  ) => Outcome<State>;
}>;

type Reached<State> = Readonly<{
  decided: ReadonlyMap<string, Verdict>;
  order: readonly string[];
  state: State;
}>;

const keyOf = (decisions: ReadonlyMap<string, Verdict>) =>
  [...decisions]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([change, verdict]) => `${verdict} ${change}`)
    .join(', ');

function* verdictSets(changes: readonly string[]) {
  for (let code = 1; code < 3 ** changes.length; code++) {
    yield new Map(
      changes.flatMap((change, index): Array<[string, Verdict]> => {
        const digit = Math.floor(code / 3 ** index) % 3;
        if (digit === 0) return [];
        return [[change, digit === 1 ? 'accept' : 'reject']];
      })
    );
  }
}

const within = (
  part: ReadonlyMap<string, Verdict>,
  whole: ReadonlyMap<string, Verdict>
) => [...part].every(([change, verdict]) => whole.get(change) === verdict);

const explore = <State>(walk: Walk<State>) => {
  const failures: Failure[] = [];
  const { pending } = walk;
  const atOnce = new Map<string, Outcome<State>>();
  // Each set of verdicts some calls reached, with each distinct state it
  // reached and the first order that reached it.
  const reached = new Map<string, Map<string, Reached<State>>>();
  const walked = new Map<string, boolean>();
  let compared = 0;
  const atOnceOf = (decisions: ReadonlyMap<string, Verdict>) => {
    const key = keyOf(decisions);
    const cached = atOnce.get(key);
    if (cached) return cached;
    const outcome = walk.step(walk.start, new Map(), decisions);
    atOnce.set(key, outcome);
    return outcome;
  };
  const reach = (
    decided: ReadonlyMap<string, Verdict>,
    order: readonly string[],
    state: State
  ) => {
    const key = keyOf(decided);
    const states = reached.get(key) ?? new Map<string, Reached<State>>();
    reached.set(key, states);
    const same = walk.same?.(state) ?? JSON.stringify(state);
    if (!states.has(same)) states.set(same, { decided, order, state });
  };
  // Whether a state that more than one call reached reads as deciding its
  // verdicts at once does; a call that waits there leaves nothing to compare.
  const agrees = (
    decided: ReadonlyMap<string, Verdict>,
    identity: string,
    state: State
  ) => {
    const expected = atOnceOf(decided);
    if (expected.kind === 'waits') return true;
    compared += 1;
    const actual = walk.read(state);
    const told = `  one at a time: ${actual.shown}`;
    if (expected.kind === 'refused') {
      failures.push({
        detail: `${told}\n  all at once:   ${expected.reason}`,
        identity,
      });
      return false;
    }
    const wanted = walk.read(expected.state);
    if (isDeepStrictEqual(actual.seen, wanted.seen)) return true;
    failures.push({
      detail: `${told}\n  all at once:   ${wanted.shown}`,
      identity,
    });
    return false;
  };
  const descend = (
    decided: ReadonlyMap<string, Verdict>,
    order: readonly string[],
    state: State,
    reporting: boolean
  ) => {
    for (const change of pending) {
      if (decided.has(change)) continue;
      for (const verdict of ['accept', 'reject'] as const) {
        const steps = [...order, `${verdict} ${change}`];
        const identity = `${walk.name}: ${steps.join(', ')}`;
        const now = new Map(decided).set(change, verdict);
        const outcome = walk.step(state, decided, new Map([[change, verdict]]));
        if (outcome.kind === 'waits') continue;
        if (outcome.kind === 'refused') {
          if (reporting) {
            failures.push({
              detail: `  the last step is ${outcome.reason}`,
              identity,
            });
          }
          continue;
        }
        reach(now, steps, outcome.state);
        if (walk.same) {
          const same = `${keyOf(now)} ${walk.same(outcome.state)}`;
          if (walked.get(same) || (walked.has(same) && !reporting)) continue;
          walked.set(same, reporting);
        }
        const decidesAlone = order.length === 0;
        descend(
          now,
          steps,
          outcome.state,
          reporting && (decidesAlone || agrees(now, identity, outcome.state))
        );
      }
    }
  };
  reach(new Map(), [], walk.start);
  descend(new Map(), [], walk.start, true);

  // A set of verdicts no order of single steps reaches may settle when the
  // verdicts it adds to a reached set are decided in one call. That call is a
  // step too, and the walk goes on from its result, so a set behind it is
  // checked as well. The smallest sets are tried first, from the largest
  // reached set inside them, so each coupled set reported is a minimal one.
  const together: Array<[string, string]> = [];
  const bySize = [...verdictSets(pending)].sort((a, b) => a.size - b.size);
  for (const decisions of bySize) {
    const key = keyOf(decisions);
    if (reached.has(key)) continue;
    const from = [...reached.values()]
      .flatMap((states) => [...states.values()])
      .filter(
        ({ decided }) =>
          decisions.size - decided.size >= 2 && within(decided, decisions)
      )
      .sort((a, b) => b.decided.size - a.decided.size);
    for (const { decided, order, state } of from) {
      const deciding = new Map(
        [...decisions].filter(([change]) => !decided.has(change))
      );
      const outcome =
        decided.size === 0
          ? atOnceOf(decisions)
          : walk.step(state, decided, deciding);
      if (outcome.kind !== 'settled') continue;
      together.push([
        decided.size === 0
          ? `${walk.name}: ${key}`
          : `${walk.name}: ${keyOf(decided)}, then (${keyOf(deciding)})`,
        walk.read(outcome.state).shown,
      ]);
      const steps = [...order, `(${keyOf(deciding)})`];
      reach(decisions, steps, outcome.state);
      descend(
        decisions,
        steps,
        outcome.state,
        decided.size === 0 ||
          agrees(decisions, `${walk.name}: ${steps.join(', ')}`, outcome.state)
      );
      break;
    }
    if (reached.has(key)) continue;
    const outcome = atOnceOf(decisions);
    if (outcome.kind === 'refused') {
      failures.push({
        detail: `  all at once:   ${outcome.reason}, and no order reaches these verdicts`,
        identity: `${walk.name}: ${key} at once`,
      });
    }
  }
  return {
    compared,
    failures: [...failures, ...(walk.failures ?? [])],
    idle: pending.length > 1 && compared === 0 ? [walk.name] : [],
    together,
  };
};

type QuotesState = Loaded & Readonly<{ landed: readonly LandedRecord[] }>;

// Every spare a state stores, named by what it holds and not by whether a
// build took it.
const sparesOf = ({ children, reserves }: QuotesState) => {
  const found = new Set<string>();
  const add = ({ built: _built, ...spare }: { built?: boolean }) =>
    found.add(JSON.stringify(spare));
  for (const record of Object.values(reserves)) add(record as never);
  const walk = (node: Node) => {
    for (const item of node.authored ?? []) {
      if (item.kind === 'reserve') add(item);
    }
    for (const child of node.children ?? []) walk(child);
  };
  for (const node of children) walk(node as Node);
  return found;
};

const readQuotes = ({ children, landed, reserves, roots }: QuotesState) => {
  const writes = writesOf(landed, [
    ...children,
    ...Object.values(roots ?? {}).flat(),
  ]);
  const records = Object.keys(reserves).length;
  return {
    seen: { children, landed: writes, reserves, roots },
    shown: `${storyOf({ children: children as Node[], roots: roots as never })} landed [${writes}]${records > 0 ? ` reserves ${JSON.stringify(reserves)}` : ''}`,
  };
};

const acceptsOnlyContent = (
  children: readonly unknown[],
  deciding: ReadonlyMap<string, Verdict>
) =>
  [...deciding].every(
    ([change, verdict]) =>
      verdict === 'accept' &&
      kindsOf(children as Node[], change).every(
        (kind) => kind === 'insert' || kind === 'delete'
      )
  );

// The plain schema stores no spare and no shown value, so a decision there
// is its resolve and the run-scoped resolve of the commit after it.
const quotesWalk = (
  generated: Doc,
  { children: document }: Loaded
): Walk<QuotesState> => {
  const pending = changesIn(generated);
  const name = storyOf(generated);
  const failures = new Map<string, Failure>();
  const checkSettle = (
    from: QuotesState,
    now: ReadonlyMap<string, Verdict>,
    modeled: readonly JsonNode[]
  ) => {
    const identity = `${name}: settle ${keyOf(now)} over ${story(from.children)}`;
    if (failures.has(identity)) return;
    const stored = loadWithVerdicts(
      quotesEditor,
      now,
      from.children,
      from.landed
    );
    if (isDeepStrictEqual(stored, modeled)) return;
    failures.set(identity, {
      detail: `  loaded with the verdicts: ${story(stored)}\n  decided:                  ${story(modeled)}`,
      identity,
    });
  };
  return {
    get failures() {
      return [...failures.values()];
    },
    name,
    pending,
    read: readQuotes,
    start: { children: document, landed: LANDED, reserves: {} },
    step: (state, decided, deciding) => {
      const result = resolveWithVerdicts(
        decided,
        state.children,
        all(deciding),
        quotesSchema,
        state.landed
      );
      const admission = admissionOf(result, decided, deciding, pending);
      if (admission.kind !== 'settles') return admission;
      const now = new Map([...decided, ...deciding]);
      const settled = settleAsAdmission(
        now,
        result,
        state.landed,
        quotesSchema
      );
      if (acceptsOnlyContent(state.children, deciding)) {
        checkSettle(state, now, settled.children);
      }
      return { kind: 'settled', state: { ...settled, reserves: {} } };
    },
  };
};

type Committed = ReturnType<ReturnType<QuotesEditor>['read']['value']>;

// What a committed value stores: its children with each insertion written
// out on its nodes, its landed writes and every root's spare records.
const storedIn = (value: Committed): QuotesState => {
  const records = recordsOf(value);
  const { children, roots } = expandContexts(value);
  return {
    children,
    ...(roots && Object.keys(roots).length > 0 ? { roots } : {}),
    landed: Object.entries(records[LANDED_RECORDS] ?? {}).flatMap(
      ([write, json]) => parseLanded(write, JSON.stringify(json)) ?? []
    ),
    reserves: records[RESERVES] ?? {},
  };
};

// Each decision stores a fresh random token that only groups the verdicts it
// decided, so values that differ in tokens alone decide alike.
const withoutTokens = (value: unknown) =>
  JSON.stringify(value).replaceAll(/[0-9a-f]{8}:\d+/g, 'decision');

// A generated id may only come from stored content: the spares loading
// stores for each container and root a pending change can empty, and the
// values a shown id's group settles. So each step loads the value the step
// before committed and decides through the editor's public `decide`, whose
// commit admission settles, as a reviewer's does.
const committedWalk = (
  generated: Doc,
  { children, reserves, roots }: Loaded,
  editor: QuotesEditor
): Walk<Committed> => {
  const pending = changesIn(generated);
  const start = {
    children,
    ...(roots ? { roots } : {}),
    records: {
      ...reviewRecords({ landed: LANDED }),
      ...(Object.keys(reserves).length > 0 ? { [RESERVES]: reserves } : {}),
    },
  } as unknown as Committed;
  const name = storyOf(generated);
  const failures = new Map<string, Failure>();
  const checkSettle = (from: Committed, decided: Committed, now: string) => {
    const origin = storedIn(from);
    const identity = `${name}: settle ${now} over ${story(origin.children)}`;
    if (failures.has(identity)) return;
    const result = storedIn(decided);
    const dropsRoot = Object.keys(origin.roots ?? {}).some(
      (root) => !result.roots?.[root]
    );
    if (dropsRoot) return;
    const { children: stored, roots: storedRoots } = from as unknown as Doc;
    let loaded: QuotesState | string;
    try {
      loaded = storedIn(
        editor({
          children: stored,
          ...(storedRoots ? { roots: storedRoots } : {}),
          records: {
            ...recordsOf(from),
            [VERDICTS]: recordsOf(decided)[VERDICTS] ?? {},
          },
        }).read.value()
      );
    } catch (error) {
      loaded = `throws ${(error as Error).message}`;
    }
    const modeled = shownIn(result);
    const settled = typeof loaded === 'string' ? loaded : shownIn(loaded);
    const kept = typeof loaded === 'string' ? [] : storedSpares(loaded);
    const shown = typeof loaded === 'string' ? new Set() : idsIn(loaded);
    const left = storedSpares(result);
    const started = sparesOutside(storedSpares(origin), left, false).map(
      ({ content }) => content
    );
    const missing = sparesOutside(left, kept).map(
      ({ content, owner }) => `${owner} ${content}`
    );
    const extra = sparesOutside(kept, left)
      .filter(({ built, content, id }) => {
        const at = started.indexOf(content);
        if (at !== -1) started.splice(at, 1);
        return at === -1 || (!built && shown.has(id));
      })
      .map(({ content, owner }) => `${owner} ${content}`);
    if (settled === modeled && missing.length === 0 && extra.length === 0) {
      return;
    }
    failures.set(identity, {
      detail: `  loaded with the verdicts: ${settled}\n  decided:                  ${modeled}\n  spares the load lacks: ${missing.join(' ')}\n  spares only the load adds: ${extra.join(' ')}`,
      identity,
    });
  };
  return {
    get failures() {
      return [...failures.values()];
    },
    name,
    pending,
    read: (state) => {
      const stored = storedIn(state);
      return readQuotes({
        ...stored,
        children: withoutHeld(stored.children as Node[]) as never,
      });
    },
    same: withoutTokens,
    start,
    step: (state, decided, deciding) => {
      // Loading mints a spare for each place before it finds the one stored
      // there, so only the decision's own calls count.
      const loaded = editor(state);
      const generatedBefore = idGeneratorCalls.count;
      const decision = decideIn(loaded, deciding);
      const made = idGeneratorCalls.count - generatedBefore;
      if (made > 0) {
        return {
          kind: 'refused',
          reason: `calls the id generator ${made} times`,
        };
      }
      const admission = decisionAdmission(decision.result, decided, pending);
      if (admission.kind !== 'settles') return admission;
      const before = sparesOf(storedIn(state));
      const added = [...sparesOf(storedIn(decision.value))].filter(
        (spare) => !before.has(spare)
      );
      if (added.length > 0) {
        return {
          kind: 'refused',
          reason: `a decision that adds the spares ${added.join(', ')}`,
        };
      }
      if (acceptsOnlyContent(storedIn(state).children, deciding)) {
        checkSettle(
          state,
          decision.value,
          keyOf(new Map([...decided, ...deciding]))
        );
      }
      return { kind: 'settled', state: decision.value };
    },
  };
};

// Resolving for storage keeps a held member where a decision rejects a
// deletion of inserted content, and in 456 orders at --changes=3 --marks=3
// it keeps one that deciding at once does not, under the plain schema too.
// No reader sees a held member, so the comparison leaves them out.
const withoutMembers = (
  nodes: readonly Node[],
  kinds: ReadonlySet<string>
): Node[] =>
  nodes.map((node) => {
    const members = node.authored?.filter((item) => !kinds.has(item.kind));
    const { authored: _authored, ...rest } = node;
    return {
      ...rest,
      ...(members && members.length > 0 ? { authored: members } : {}),
      ...(node.children
        ? { children: withoutMembers(node.children, kinds) }
        : {}),
    };
  });
const withoutHeld = (nodes: readonly Node[]) =>
  withoutMembers(nodes, new Set(['held']));

const canonical = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [
              key,
              canonical((value as Record<string, unknown>)[key]),
            ])
        )
      : value;

const shownIn = ({ children, roots }: QuotesState) => {
  const kinds = new Set(['held', 'reserve']);
  return withoutTokens(
    canonical({
      children: withoutMembers(children as Node[], kinds),
      roots: Object.fromEntries(
        Object.entries(roots ?? {}).map(([root, nodes]) => [
          root,
          withoutMembers(nodes as Node[], kinds),
        ])
      ),
    })
  );
};

type Spare = Readonly<{
  built: boolean;
  content: string;
  id: unknown;
  owner: string;
}>;

const spareOf = (spare: unknown, owner: string): Spare => {
  const { built, node } = spare as Readonly<{ built?: unknown; node?: Node }>;

  return {
    built: built === true,
    content: withoutTokens(canonical(spare)),
    id: node?.id,
    owner,
  };
};

const idsIn = ({ children, roots }: QuotesState) => {
  const ids = new Set<unknown>();
  const walk = (node: Node) => {
    if (node.id !== undefined) ids.add(node.id);
    node.children?.forEach(walk);
  };
  for (const node of [...children, ...Object.values(roots ?? {}).flat()]) {
    walk(node as Node);
  }
  return ids;
};

const storedSpares = ({ children, reserves, roots }: QuotesState) => {
  const found: Spare[] = [];
  const walk = (node: Node, owner: string) => {
    for (const item of node.authored ?? []) {
      if (item.kind === 'reserve') found.push(spareOf(item, owner));
    }
    node.children?.forEach((child, at) => walk(child, `${owner}.${at}`));
  };
  for (const record of Object.values(reserves)) {
    found.push(spareOf(record, 'records'));
  }
  for (const [root, nodes] of [
    ['main', children],
    ...Object.entries(roots ?? {}),
  ] as const) {
    (nodes as Node[]).forEach((node, at) => walk(node, `${root}.${at}`));
  }
  return found;
};

const sparesOutside = (
  spares: readonly Spare[],
  other: readonly Spare[],
  byOwner = true
) => {
  const matchOf = ({ content, owner }: Spare) =>
    byOwner ? `${owner} ${content}` : content;
  const left = other.map(matchOf);
  return spares.filter((spare) => {
    const at = left.indexOf(matchOf(spare));
    if (at === -1) return true;
    left.splice(at, 1);
    return false;
  });
};

const withoutIdsIn = (nodes: readonly Node[]): Node[] =>
  nodes.map(({ authored, id: _id, ...node }) => {
    const members = authored?.filter(
      (item) =>
        item.kind !== 'as' && (item.kind !== 'format' || item.key !== 'id')
    );
    return {
      ...node,
      ...(members && members.length > 0 ? { authored: members } : {}),
      ...(node.children ? { children: withoutIdsIn(node.children) } : {}),
    };
  });
const withoutIds = ({ children, roots }: Doc): Doc => ({
  children: withoutIdsIn(children),
  ...(roots
    ? {
        roots: Object.fromEntries(
          Object.entries(roots).map(([root, nodes]) => [
            root,
            withoutIdsIn(nodes),
          ])
        ),
      }
    : {}),
});

// A spare stands in only for a value the plain schema never builds, so a
// generated document couples no set of verdicts that its plain twin decides
// one at a time.
const againstTwin = (
  generated: Doc,
  result: ReturnType<typeof explore>,
  places: IdPlaces
): ReturnType<typeof explore> => {
  const twin = withoutIds(generated);
  const twinEditor = generatedQuotes[places].twin;
  const loaded = normalize(twin, twinEditor);
  const name = storyOf(generated);
  if (loaded === null) {
    return {
      ...result,
      failures: [
        ...result.failures,
        { detail: '  its plain twin fails to load', identity: `${name}: twin` },
      ],
    };
  }
  const twinName = storyOf(twin);
  const coupled = new Set(
    explore(committedWalk(twin, JSON.parse(loaded), twinEditor)).together.map(
      ([identity]) => identity.slice(twinName.length)
    )
  );
  return {
    ...result,
    failures: [
      ...result.failures,
      ...result.together
        .filter(([identity]) => !coupled.has(identity.slice(name.length)))
        .map(([identity]) => ({
          detail:
            '  settles when decided together, while every order of single steps waits, and its plain twin decides it one at a time',
          identity,
        })),
    ],
  };
};

// Every give-back script edits the whole link before the split and either
// half after it. An operation besides the split is by a proposing change,
// labeled by first use as in `pickings`, or by the one Editing author; after
// the split, `s0` may also set or unset a half, as its author does when they
// keep editing inside their own suggestion. A set writes a fresh value, and
// an unset runs only where the stored ref is set, since the split drops it
// from the right half.
function* scripts(): Generator<GivebackOp[]> {
  const ops: GivebackOp[] = [];
  function* extend(
    stored: ReadonlyMap<LinkHalf, boolean>,
    removed: boolean,
    fresh: number
  ): Generator<GivebackOp[]> {
    const split = ops.some((op) => op.kind === 'split');
    if (split) yield [...ops];
    function* run(op: GivebackOp, next: ReadonlyMap<LinkHalf, boolean>) {
      ops.push(op);
      yield* extend(
        next,
        removed || op.kind === 'remove',
        op.by === `s${fresh + 1}` ? fresh + 1 : fresh
      );
      ops.pop();
    }
    if (!split) {
      yield* run(
        { by: 's0', kind: 'split' },
        new Map([
          ['left', stored.get('whole') ?? false],
          ['right', false],
        ])
      );
    }
    if (ops.length - (split ? 1 : 0) === givebackBound.ops) return;
    const authors = [
      ...(split ? ['s0'] : []),
      ...Array.from(
        { length: Math.min(fresh + 1, givebackBound.changes) },
        (_, at) => `s${at + 1}`
      ),
      ...(givebackBound.edits === 1 ? [EDITING] : []),
    ];
    const places: readonly LinkHalf[] = split
      ? removed
        ? ['right']
        : ['left', 'right']
      : ['whole'];
    for (const by of authors) {
      for (const at of places) {
        yield* run(
          {
            at,
            by,
            kind: 'set',
            value: `v${ops.filter((op) => op.kind === 'set').length + 1}`,
          },
          new Map(stored).set(at, true)
        );
        if (stored.get(at)) {
          yield* run({ at, by, kind: 'unset' }, new Map(stored).set(at, false));
        }
      }
      if (split && !removed && by !== 's0') {
        yield* run({ by, kind: 'remove' }, stored);
      }
    }
  }
  yield* extend(new Map([['whole', true]]), false, 0);
}

const opStory = (op: GivebackOp) => {
  const by = op.by === EDITING ? 'editing' : op.by;
  if (op.kind === 'split') return `${by} splits`;
  if (op.kind === 'remove') return `${by} removes left`;
  if (op.kind === 'unset') return `${by} unsets ${op.at}`;
  return `${by} sets ${op.at} ${op.value}`;
};

const givebackWalk = (
  script: readonly GivebackOp[],
  start: unknown
): Walk<unknown> => {
  const proposers = new Set(
    script.flatMap((op) => (op.by === EDITING ? [] : [op.by]))
  );
  const pending = changesIn(start as Doc).filter((change) =>
    proposers.has(change)
  );
  const outcomeOf = (
    { result, value }: ReturnType<typeof decideIn>,
    decided: ReadonlyMap<string, Verdict>
  ): Outcome<unknown> => {
    const admission = decisionAdmission(result, decided, pending);
    return admission.kind === 'settles'
      ? { kind: 'settled', state: value }
      : admission;
  };
  return {
    name: script.map(opStory).join(', '),
    pending,
    read: (state) => {
      const seen = givebackRead(state);
      return { seen, shown: story(seen) };
    },
    same: withoutTokens,
    start,
    step: (state, decided, deciding) => {
      const loaded = givebackEditor(state, givebackIds);
      const generatedBefore = idGeneratorCalls.count;
      const decision = decideIn(loaded, deciding);
      const made = idGeneratorCalls.count - generatedBefore;
      if (made > 0) {
        return {
          kind: 'refused',
          reason: `calls the id generator ${made} times`,
        };
      }
      return outcomeOf(decision, decided);
    },
  };
};

// Scripts share prefixes, so a worker records each prefix once.
const prefixes = new Map<string, unknown>();

// A script whose operation throws, or leaves the children and their marks as
// they were, models a write recording never makes.
const recorded = (script: readonly GivebackOp[]) => {
  let value: unknown = givebackStart(givebackIds);
  for (const [at, op] of script.entries()) {
    const prefix = JSON.stringify(script.slice(0, at + 1));
    const known = prefixes.get(prefix);
    if (known !== undefined) {
      value = known;
      continue;
    }
    let next: unknown;
    try {
      next = recordGiveback(value, op, at, givebackIds);
    } catch (error) {
      return `${opStory(op)} throws ${(error as Error).message}`;
    }
    if (
      isDeepStrictEqual(
        (next as { children: unknown }).children,
        (value as { children: unknown }).children
      )
    ) {
      return `${opStory(op)} changes nothing`;
    }
    prefixes.set(prefix, next);
    value = next;
  }
  return { value };
};

const summed = (results: ReadonlyArray<ReturnType<typeof explore>>) => ({
  compared: results.reduce((sum, result) => sum + result.compared, 0),
  failures: results.flatMap((result) => result.failures),
  idle: results.flatMap((result) => result.idle),
  together: results.flatMap((result) => result.together),
});

const shard = process.env.AUTHORED_ORDER_SHARD;
// The id variant a quotes worker runs, or none for the plain schema.
const shardPlaces = (process.env.AUTHORED_ORDER_IDS || null) as IdPlaces | null;
const givebackIds = shardPlaces !== null;

if (shard === 'normalize') {
  const items: Array<[number, Doc]> = JSON.parse(await Bun.stdin.text());
  console.log(
    JSON.stringify(
      items.map(([index, generated]) => [
        index,
        normalize(generated, editorFor(shardPlaces)),
      ])
    )
  );
} else if (shard === 'explore') {
  const items: Array<[Doc, Loaded]> = JSON.parse(await Bun.stdin.text());
  console.log(
    JSON.stringify({
      ...summed(
        items.map(([generated, document]) =>
          shardPlaces
            ? againstTwin(
                generated,
                explore(
                  committedWalk(generated, document, editorFor(shardPlaces))
                ),
                shardPlaces
              )
            : explore(quotesWalk(generated, document))
        )
      ),
      unchecked: [],
    })
  );
} else if (shard === 'giveback') {
  const items: GivebackOp[][] = JSON.parse(await Bun.stdin.text());
  const unchecked: string[] = [];
  const results = items.flatMap((script) => {
    const outcome = recorded(script);
    if (typeof outcome === 'string') {
      unchecked.push(outcome);
      return [];
    }
    return [explore(givebackWalk(script, outcome.value))];
  });
  console.log(JSON.stringify({ ...summed(results), unchecked }));
} else {
  const jobs = wholeFlag('jobs', availableParallelism());
  const fanOut = async <T>(
    role: string,
    items: readonly unknown[],
    places: IdPlaces | null = null
  ) =>
    Promise.all(
      Array.from({ length: jobs }, async (_, index) => {
        const child = Bun.spawn(
          [
            process.execPath,
            ...process.execArgv,
            process.argv[1],
            ...process.argv.slice(2),
          ],
          {
            env: {
              ...process.env,
              AUTHORED_ORDER_IDS: places ?? '',
              AUTHORED_ORDER_SHARD: role,
            },
            stderr: 'inherit',
            stdin: new Blob([
              JSON.stringify(items.filter((_item, at) => at % jobs === index)),
            ]),
            stdout: 'pipe',
          }
        );
        const output = await new Response(child.stdout).text();
        if ((await child.exited) !== 0) {
          throw new Error(
            `${role} shard ${index} exited ${child.exitCode ?? child.signalCode}`
          );
        }
        return JSON.parse(output.trim().split('\n').at(-1) ?? '') as T;
      })
    );
  type Explored = ReturnType<typeof summed> & { unchecked: string[] };
  const gathered = (explored: readonly Explored[]) => {
    const settled = explored
      .flatMap((result) => result.together)
      .sort(([a], [b]) => a.localeCompare(b));
    return {
      compared: explored.reduce((sum, result) => sum + result.compared, 0),
      failures: explored
        .flatMap((result) => result.failures)
        .sort((a, b) => a.identity.localeCompare(b.identity)),
      idle: explored.flatMap((result) => result.idle),
      settled,
      together: settled.map(([identity]) => identity),
      unchecked: explored.flatMap((result) => result.unchecked),
    };
  };
  const seconds = (started: number) =>
    Math.round((performance.now() - started) / 100) / 10;
  const unchecked: string[] = [];
  const found = new Map<Family, ReturnType<typeof gathered>>();

  if (runs('quotes')) {
    const runsOf: Array<ReturnType<typeof gathered>> = [];
    for (const places of schemas) {
      const started = performance.now();
      const generated = generate(places);
      const shards = await fanOut<Array<[number, string | null]>>(
        'normalize',
        generated.map((document, index) => [index, document]),
        places
      );
      const normalized = shards.flat().sort(([a], [b]) => a - b);
      const unique = new Map<string, [Doc, Loaded]>();
      for (const [index, document] of normalized) {
        if (document !== null && !unique.has(document)) {
          unique.set(document, [generated[index], JSON.parse(document)]);
        }
      }
      const result = gathered(
        await fanOut<Explored>('explore', [...unique.values()], places)
      );
      runsOf.push(result);
      console.info(
        JSON.stringify({
          bound,
          compared: result.compared,
          documents: unique.size,
          failures: result.failures.length,
          family: 'quotes',
          generated: generated.length,
          schema: places ?? 'plain',
          seconds: seconds(started),
          together: result.together.length,
        })
      );
      const rejected = normalized.filter(([, document]) => document === null);
      const merged = normalized.length - rejected.length - unique.size;
      if (
        rejected.length > 0 ||
        merged > 0 ||
        normalized.length < generated.length ||
        result.idle.length > 0
      ) {
        unchecked.push(
          `Of ${generated.length} generated documents under the ${places ?? 'plain'} schema, ${normalized.length} came back from the workers, ${rejected.length} fail to load in the quotes editor, ${merged} normalize to a document another one gives, and ${result.idle.length} with two or more changes have no order the script could compare. Either the generator builds a shape recording never writes, or the editor or resolver now refuses or rewrites documents and decisions it accepted, which leaves the property unchecked on those documents.`
        );
      }
    }
    found.set('quotes', {
      compared: runsOf.reduce((sum, result) => sum + result.compared, 0),
      failures: runsOf.flatMap((result) => result.failures),
      idle: runsOf.flatMap((result) => result.idle),
      settled: runsOf.flatMap((result) => result.settled),
      together: runsOf.flatMap((result) => result.together),
      unchecked: runsOf.flatMap((result) => result.unchecked),
    });
  }

  if (runs('giveback')) {
    const started = performance.now();
    const written = [...scripts()].filter(
      (script) =>
        onlyScript === undefined ||
        script.map(opStory).join(', ') === onlyScript
    );
    if (written.length === 0) {
      console.error(`No give-back script in the bound reads ${onlyScript}.`);
      process.exit(2);
    }
    const givebackPlaces = schemaFlag === 'plain' ? null : 'elements';
    const result = gathered(
      await fanOut<Explored>('giveback', written, givebackPlaces)
    );
    found.set('giveback', result);
    console.info(
      JSON.stringify({
        bound: givebackBound,
        compared: result.compared,
        documents: written.length - result.unchecked.length,
        failures: result.failures.length,
        family: 'giveback',
        idle: result.idle.length,
        schema: givebackPlaces ?? 'plain',
        seconds: seconds(started),
        together: result.together.length,
      })
    );
    // Unlike a quotes document, a script can leave no order to compare: two
    // changes that each wait on the other settle only in one call, so their
    // coupled set is all that checks it.
    if (result.unchecked.length > 0) {
      unchecked.push(
        `Of ${written.length} give-back scripts, ${result.unchecked.length} do not record, such as ${result.unchecked[0]}. The generator writes an operation recording never makes, which leaves the property unchecked on those scripts.`
      );
    }
  }

  if (unchecked.length > 0) {
    for (const reason of unchecked) console.error(reason);
    process.exit(1);
  }

  const togetherFile = flag('together');
  if (togetherFile) {
    writeFileSync(
      togetherFile,
      [...found.values()]
        .flatMap((result) => result.settled)
        .map(([identity, result]) => `${identity} => ${result}\n`)
        .join('')
    );
  }

  const failures = [...found.values()].flatMap((result) => result.failures);
  const show = (identities: ReadonlySet<string>) => {
    for (const failure of failures.filter((item) =>
      identities.has(item.identity)
    )) {
      console.error(`\n${failure.identity}\n${failure.detail}`);
    }
  };
  const showTogether = (identities: readonly string[]) => {
    for (const identity of identities) {
      console.error(
        `\n${identity}\n  settles when decided together, while every order of single steps waits`
      );
    }
  };
  const rules = [
    ['quotes', RULE, TOGETHER, OWNER],
    ['giveback', GIVEBACK_RULE, GIVEBACK_TOGETHER, GIVEBACK_OWNER],
  ] as const;

  if (atGate) {
    const known = readBaseline(BASELINE);
    const listed = new Set(
      rules.flatMap(([, rule, , owner]) => known[rule]?.[owner] ?? [])
    );
    show(
      new Set(
        failures
          .map((failure) => failure.identity)
          .filter((identity) => !listed.has(identity))
      )
    );
    for (const [name, , together, owner] of rules) {
      const coupled = new Set<string>(known[together]?.[owner]);
      showTogether(
        (found.get(name)?.together ?? []).filter((item) => !coupled.has(item))
      );
    }
    process.exitCode = enforceBaseline({
      file: BASELINE,
      found: Object.fromEntries(
        rules.flatMap(([name, rule, together, owner]) => [
          [
            rule,
            {
              [owner]:
                found.get(name)?.failures.map((failure) => failure.identity) ??
                [],
            },
          ],
          [together, { [owner]: found.get(name)?.together ?? [] }],
        ])
      ),
      lowerCommand: 'pnpm check:authored-order --lower',
      mode: process.argv.includes('--lower')
        ? 'lower'
        : process.argv.includes('--init')
          ? 'init'
          : 'check',
      newFindingsHelp: `A ${RULE} or ${GIVEBACK_RULE} entry decides its changes one at a time and gets another document than deciding them at once, or the resolver refuses a step no other pending change holds. A ${TOGETHER} or ${GIVEBACK_TOGETHER} entry settles only when its verdicts are decided at once, so no order checks it, and a resolver change that adds such a wait can hide a decision-order failure. Fix the resolver; the baseline never grows.`,
      rules: rules.flatMap(([, rule, together]) => [rule, together]),
    });
  } else {
    show(new Set(failures.map((failure) => failure.identity)));
    process.exitCode = failures.length > 0 ? 1 : 0;
  }
}
