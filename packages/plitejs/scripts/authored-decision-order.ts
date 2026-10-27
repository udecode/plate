import { writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { isDeepStrictEqual } from 'node:util';

import {
  enforceBaseline,
  readBaseline,
} from '../../../tooling/scripts/finding-baseline.mjs';
import type { AuthoredResult } from '../src/authored';
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
import { getDefined } from '../src/internal/get-defined';
import { recordsOf, reviewRecords } from '../test/support/authored';
import {
  admissionOf,
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
  type LiftKey,
  type LiftOp,
  type LiftPiece,
  type LiftQuote,
  type LinkHalf,
  liftStart,
  pendingIn,
  pendingRead,
  quotesEditor,
  quotesSchema,
  recordGiveback,
  recordLift,
  resolveWithVerdicts,
  all,
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
const LIFT_BOUND = {
  bridge: 0,
  changes: 2,
  edits: 0,
  enter: 'inline',
  enters: 1,
  inserts: 0,
  interleave: 0,
  key: 'url',
  ops: 2,
  outside: 0,
  pair: 0,
  place: 0,
  quote: 0,
  seed: 0,
  writes: 0,
};
// `mixed` writes the ref a split drops or the metadata note, each per write.
const LIFT_KEYS: ReadonlyArray<LiftKey | 'mixed'> = [
  'mixed',
  'note',
  'ref',
  'url',
];
const FAMILIES = ['giveback', 'lift', 'quotes'] as const;

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
      !/^--(?:(?:blocks|changes|family|giveback-changes|giveback-edits|giveback-ops|giveback-script|jobs|lift-bridge|lift-changes|lift-edits|lift-enter|lift-enters|lift-inserts|lift-interleave|lift-key|lift-ops|lift-outside|lift-pair|lift-place|lift-quote|lift-script|lift-seed|lift-shard|lift-writes|marks|schema|together)=.*|init|lower)$/.test(
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
const liftBound = {
  bridge: wholeFlag('lift-bridge', LIFT_BOUND.bridge, 0),
  changes: wholeFlag('lift-changes', LIFT_BOUND.changes),
  edits: wholeFlag('lift-edits', LIFT_BOUND.edits, 0),
  enter: flag('lift-enter') ?? LIFT_BOUND.enter,
  enters: wholeFlag('lift-enters', LIFT_BOUND.enters),
  inserts: wholeFlag('lift-inserts', LIFT_BOUND.inserts, 0),
  interleave: wholeFlag('lift-interleave', LIFT_BOUND.interleave, 0),
  key: (flag('lift-key') ?? LIFT_BOUND.key) as LiftKey | 'mixed',
  ops: wholeFlag('lift-ops', LIFT_BOUND.ops, 0),
  outside: wholeFlag('lift-outside', LIFT_BOUND.outside, 0),
  pair: wholeFlag('lift-pair', LIFT_BOUND.pair, 0),
  place: wholeFlag('lift-place', LIFT_BOUND.place, 0),
  quote: wholeFlag('lift-quote', LIFT_BOUND.quote, 0),
  seed: wholeFlag('lift-seed', LIFT_BOUND.seed, 0),
  writes: wholeFlag('lift-writes', LIFT_BOUND.writes, 0),
};
if (!LIFT_KEYS.includes(liftBound.key)) {
  console.error(`--lift-key takes ${LIFT_KEYS.join(', ')}.`);
  process.exit(2);
}
if (liftBound.seed > 1) {
  console.error('--lift-seed takes 0 or 1.');
  process.exit(2);
}
if (liftBound.enters > 2) {
  console.error('--lift-enters takes 1 or 2.');
  process.exit(2);
}
if (!['both', 'inline', 'paragraph'].includes(liftBound.enter)) {
  console.error('--lift-enter takes inline, paragraph or both.');
  process.exit(2);
}
if (liftBound.interleave > 1) {
  console.error('--lift-interleave takes 0 or 1.');
  process.exit(2);
}
if (liftBound.inserts > 1) {
  console.error('--lift-inserts takes 0 or 1.');
  process.exit(2);
}
if (liftBound.place > 1) {
  console.error('--lift-place takes 0 or 1.');
  process.exit(2);
}
if (liftBound.outside > 2) {
  console.error('--lift-outside takes 0, 1 or 2.');
  process.exit(2);
}
if (liftBound.edits > 1) {
  console.error('--lift-edits takes 0 or 1.');
  process.exit(2);
}
if (liftBound.pair > 3) {
  console.error('--lift-pair takes 0, 1, 2 or 3.');
  process.exit(2);
}
if (liftBound.quote > 1) {
  console.error('--lift-quote takes 0 or 1.');
  process.exit(2);
}
// The bridge's `q` and `r` follow the link's paragraph, where the other
// starts find their own blocks.
if (
  liftBound.bridge > 1 ||
  (liftBound.bridge === 1 &&
    liftBound.pair + liftBound.outside + liftBound.quote > 0)
) {
  console.error(
    '--lift-bridge takes 0 or 1, and --lift-bridge=1 takes neither --lift-pair, --lift-outside nor --lift-quote.'
  );
  process.exit(2);
}
// The pair's `q` sits between the links, where `--lift-outside` finds
// another shape, and a quote holds the link's paragraph, where
// `--lift-place` and `d` find another.
if (
  (liftBound.pair > 0 && liftBound.outside > 0) ||
  (liftBound.quote === 1 &&
    (liftBound.pair > 0 || liftBound.place > 0 || liftBound.outside === 2))
) {
  console.error(
    '--lift-pair does not take --lift-outside, and --lift-quote=1 takes neither --lift-pair, --lift-place=1 nor --lift-outside=2.'
  );
  process.exit(2);
}
if (givebackBound.edits > 1) {
  console.error('--giveback-edits takes 0 or 1.');
  process.exit(2);
}
const family = flag('family');
if (family !== undefined && !FAMILIES.includes(family as Family)) {
  console.error(`--family takes ${FAMILIES.join(' or ')}.`);
  process.exit(2);
}
// The lift family still finds the rejected Enter's open decision-order
// failures, so it runs only when named, outside the gate and its baseline.
const runs = (name: Family) =>
  family === name || (family === undefined && name !== 'lift');
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
const onlyLift = flag('lift-script');
// `--lift-shard=2/3` runs every third lift script from the second on, so a
// family past the time budget runs in parts that cover it together.
const [liftPart, liftParts] = (flag('lift-shard') ?? '1/1')
  .split('/')
  .map(Number);
if (
  !Number.isInteger(liftPart) ||
  !Number.isInteger(liftParts) ||
  liftPart < 1 ||
  liftPart > liftParts
) {
  console.error('--lift-shard takes <part>/<parts>, such as 2/3.');
  process.exit(2);
}
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
  /**
   * Decides each order the walk takes on one editor too, from the start, and
   * compares what it reads after each step with `read` of the loaded state
   * the same steps reach.
   */
  continued?: Continued<unknown>;
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

/**
 * An editor that decides one order's steps itself, so the cards and facts
 * it carries from one decision to the next meet every step. `begun`
 * is the editor a first step from the start decided on, which already is
 * one.
 */
type Continued<Live> = Readonly<{
  begun: (state: unknown) => Live | undefined;
  open: () => Live;
  read: (live: Live) => Readonly<{ seen: unknown; shown: string }>;
  step: (
    live: Live,
    decided: ReadonlyMap<string, Verdict>,
    deciding: ReadonlyMap<string, Verdict>
  ) => Outcome<Live>;
}>;

type Trail = ReadonlyArray<ReadonlyMap<string, Verdict>>;

type Reached<State> = Readonly<{
  decided: ReadonlyMap<string, Verdict>;
  order: readonly string[];
  state: State;
  trail: Trail;
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
  const { continued, pending } = walk;
  const atOnce = new Map<string, Outcome<State>>();
  // Each set of verdicts some calls reached, with each distinct state it
  // reached and the first order that reached it.
  const reached = new Map<string, Map<string, Reached<State>>>();
  const walked = new Map<string, boolean>();
  let compared = 0;
  let followed = 0;
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
    trail: Trail,
    state: State
  ) => {
    const key = keyOf(decided);
    const states = reached.get(key) ?? new Map<string, Reached<State>>();
    reached.set(key, states);
    const same = walk.same?.(state) ?? JSON.stringify(state);
    if (!states.has(same)) states.set(same, { decided, order, state, trail });
  };
  const toldOf = (outcome: Outcome<unknown>) =>
    outcome.kind === 'settled'
      ? getDefined(continued).read(outcome.state).shown
      : outcome.kind === 'waits'
        ? 'waits'
        : `refuses, ${outcome.reason}`;
  // An editor that decided `trail`'s calls one after another from the
  // start. The walk followed them on another editor already, so each settles
  // again unless deciding is not deterministic.
  const replay = (trail: Trail, identity: string) => {
    const one = getDefined(continued);
    const live = one.open();
    let decided = new Map<string, Verdict>();
    for (const deciding of trail) {
      const outcome = one.step(live, decided, deciding);
      if (outcome.kind !== 'settled') {
        failures.push({
          detail: `  continued editor: ${toldOf(outcome)} at ${keyOf(deciding)} when replayed on a fresh editor`,
          identity,
        });
        return undefined;
      }
      decided = new Map([...decided, ...deciding]);
    }
    return live;
  };
  // Whether the continued editor's step reads as the loaded editor's: the
  // editor to go on with, or null after a failure.
  const followsOn = (
    identity: string,
    outcome: Outcome<unknown>,
    state: State
  ): Readonly<{ live?: unknown }> | null => {
    followed += 1;
    const loaded = walk.read(state);
    const actual =
      outcome.kind === 'settled'
        ? getDefined(continued).read(outcome.state)
        : undefined;
    if (actual && isDeepStrictEqual(actual.seen, loaded.seen)) {
      return outcome.kind === 'settled' ? { live: outcome.state } : null;
    }
    failures.push({
      detail: `  continued editor: ${actual?.shown ?? toldOf(outcome)}\n  loaded editor:    ${loaded.shown}`,
      identity,
    });
    return null;
  };
  // Every later step from two states with one `same` key gives one outcome,
  // so an order the walk dropped for reaching a known state reads the loaded
  // outcomes the first order to reach it computed.
  const loadedSteps = new Map<string, Outcome<State>>();
  const loadedStep = (
    at: string | undefined,
    state: State,
    decided: ReadonlyMap<string, Verdict>,
    deciding: ReadonlyMap<string, Verdict>
  ) => {
    if (at === undefined) return walk.step(state, decided, deciding);
    const key = `${at} then ${keyOf(deciding)}`;
    const known = loadedSteps.get(key);
    if (known) return known;
    const outcome = walk.step(state, decided, deciding);
    loadedSteps.set(key, outcome);
    return outcome;
  };
  // Whether a state reads as deciding its verdicts at once does, as `agrees`
  // judges it, without counting or reporting it again.
  const readsAsAtOnce = (
    decided: ReadonlyMap<string, Verdict>,
    state: State
  ) => {
    const expected = atOnceOf(decided);
    const { seen } = walk.read(state);
    if (expected.kind === 'waits') {
      const first = firstReads.get(keyOf(decided));
      return first === undefined || isDeepStrictEqual(seen, first.seen);
    }
    return (
      expected.kind === 'settled' &&
      isDeepStrictEqual(seen, walk.read(expected.state).seen)
    );
  };
  // What the first order to reach each set of verdicts read, for the sets
  // whose at-once call waits.
  const firstReads = new Map<
    string,
    Readonly<{ identity: string; seen: unknown; shown: string }>
  >();
  // Whether a state that more than one call reached reads as deciding its
  // verdicts at once does. Where that call waits, the state must read as the
  // first order to reach the same verdicts read.
  const agrees = (
    decided: ReadonlyMap<string, Verdict>,
    identity: string,
    state: State
  ) => {
    const expected = atOnceOf(decided);
    const actual = walk.read(state);
    if (expected.kind === 'waits') {
      const key = keyOf(decided);
      const first = firstReads.get(key);
      if (!first) {
        firstReads.set(key, { identity, ...actual });
        return true;
      }
      compared += 1;
      if (isDeepStrictEqual(actual.seen, first.seen)) return true;
      failures.push({
        detail: `  one at a time: ${actual.shown}\n  first order:   ${first.shown}, from ${first.identity}`,
        identity,
      });
      return false;
    }
    compared += 1;
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
  const sameAt = (decided: ReadonlyMap<string, Verdict>, state: State) =>
    continued && walk.same
      ? `${keyOf(decided)} ${walk.same(state)}`
      : undefined;
  // `follow` holds the continued editor at `trail` while the walk follows
  // this order on one, with no editor when the next step must replay the
  // trail, since an editor cannot fork and an earlier sibling took it.
  // Two orders that reach the same verdicts and value carry different editor
  // state, so an order the loaded walk drops through `same` goes on in
  // `dropped` mode: only the continued editor decides, and each step is
  // compared with the loaded outcome the first order computed.
  const descend = (
    decided: ReadonlyMap<string, Verdict>,
    order: readonly string[],
    trail: Trail,
    state: State,
    reporting: boolean,
    follow: Readonly<{ live?: unknown }> | null,
    at = sameAt(decided, state),
    dropped = false
  ) => {
    if (dropped && (follow === null || continued === undefined)) return;
    const tries = pending.flatMap((change) =>
      decided.has(change)
        ? []
        : (['accept', 'reject'] as const).map((verdict) => {
            const deciding = new Map([[change, verdict]]);
            const steps = [...order, `${verdict} ${change}`];
            return {
              deciding,
              identity: `${walk.name}: ${steps.join(', ')}`,
              now: new Map(decided).set(change, verdict),
              outcome: loadedStep(at, state, decided, deciding),
              steps,
            };
          })
    );
    let held = follow?.live;
    let following = follow !== null && continued !== undefined;
    // A step the loaded editor waits on must wait on the continued one too.
    // A wait commits nothing, so the editor stays at `trail`. From the start
    // both editors make the same calls.
    for (const { deciding, identity, outcome } of tries) {
      if (!following || trail.length === 0 || outcome.kind !== 'waits') {
        continue;
      }
      held ??= replay(trail, identity);
      if (held === undefined) {
        following = false;
        break;
      }
      const probe = getDefined(continued).step(held, decided, deciding);
      followed += 1;
      if (probe.kind === 'waits') continue;
      failures.push({
        detail: `  continued editor: ${toldOf(probe)}\n  loaded editor:    waits`,
        identity,
      });
      if (probe.kind === 'settled') held = undefined;
    }
    for (const { deciding, identity, now, outcome, steps } of tries) {
      if (outcome.kind === 'waits') continue;
      if (outcome.kind === 'refused') {
        // The first order to reach this state reported the refusal already.
        if (reporting && !dropped) {
          failures.push({
            detail: `  the last step is ${outcome.reason}`,
            identity,
          });
        }
        continue;
      }
      const next = [...trail, deciding];
      const same = walk.same
        ? `${keyOf(now)} ${walk.same(outcome.state)}`
        : undefined;
      let drops = dropped;
      if (!dropped) {
        reach(now, steps, next, outcome.state);
        if (same !== undefined) {
          drops = walked.get(same) || (walked.has(same) && !reporting);
          if (!drops) walked.set(same, reporting);
        }
      }
      if (drops && !(following && reporting)) continue;
      const agreed = drops
        ? readsAsAtOnce(now, outcome.state)
        : reporting &&
          (order.length === 0 || agrees(now, identity, outcome.state));
      let after: Readonly<{ live?: unknown }> | null = null;
      if (following && agreed) {
        const one = getDefined(continued);
        const begun = trail.length === 0 ? one.begun(outcome.state) : undefined;
        const live =
          begun ??
          held ??
          (trail.length === 0 ? one.open() : replay(trail, identity));
        held = undefined;
        if (live !== undefined) {
          after = followsOn(
            identity,
            begun === undefined
              ? one.step(live, decided, deciding)
              : { kind: 'settled', state: begun },
            outcome.state
          );
        }
      }
      descend(
        now,
        steps,
        next,
        outcome.state,
        agreed,
        after,
        continued ? same : undefined,
        drops
      );
    }
  };
  reach(new Map(), [], [], walk.start);
  descend(new Map(), [], [], walk.start, true, {});

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
    for (const { decided, order, state, trail } of from) {
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
      const identity = `${walk.name}: ${steps.join(', ')}`;
      const next = [...trail, deciding];
      reach(decisions, steps, next, outcome.state);
      const agreed =
        decided.size === 0 || agrees(decisions, identity, outcome.state);
      let after: Readonly<{ live?: unknown }> | null = null;
      if (continued && agreed) {
        const begun =
          decided.size === 0 ? continued.begun(outcome.state) : undefined;
        const live =
          begun ??
          (decided.size === 0 ? continued.open() : replay(trail, identity));
        if (live !== undefined) {
          after = followsOn(
            identity,
            begun === undefined
              ? continued.step(live, decided, deciding)
              : { kind: 'settled', state: begun },
            outcome.state
          );
        }
      }
      descend(decisions, steps, next, outcome.state, agreed, after);
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
    followed,
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

// What a lift script leaves on one piece of the link: the kinds done to it,
// whether a change typed into the empty text after it, the keys it holds, the
// keys a change unset on it and who wrote it.
type LiftPieceState = {
  done: Set<'empty' | 'remove' | 'type' | 'unwrap'>;
  held: Set<LiftKey>;
  typedAfter: boolean;
  unset: Set<LiftKey>;
  writers: Set<string>;
};

const onSecond = (op: LiftOp) => 'second' in op && op.second === true;

// The pieces `ops` leaves on the first link or, with `second`, on the second
// link, in order. When a link is split twice, the new piece takes what the
// piece it cuts holds and who wrote it, but not the ref a split drops.
const piecesOf = (ops: readonly LiftOp[], second = false) => {
  const seeded: LiftKey[] =
    liftBound.seed === 1 && liftBound.key !== 'mixed' && liftBound.key !== 'ref'
      ? [liftBound.key]
      : [];
  const piece = (held: readonly LiftKey[]): LiftPieceState => ({
    done: new Set(),
    held: new Set(held),
    typedAfter: false,
    unset: new Set(),
    writers: new Set(),
  });
  const pieces: LiftPieceState[] = [];
  for (const op of ops) {
    if (
      op.kind === 'between' ||
      op.kind === 'bridge' ||
      op.kind === 'join' ||
      op.kind === 'outside' ||
      op.kind === 'quote' ||
      onSecond(op) !== second
    ) {
      continue;
    }
    if (op.kind === 'split') {
      if (pieces.length === 0) {
        pieces.push(piece([...seeded, 'ref']), piece(seeded));
        continue;
      }
      const at =
        (ops[0] as Extract<LiftOp, { kind: 'split' }>).at === 1 ? 1 : 0;
      const cut = getDefined(pieces[at]);
      pieces.splice(at + 1, 0, {
        done: new Set(),
        held: new Set([...cut.held].filter((key) => key !== 'ref')),
        typedAfter: cut.typedAfter,
        unset: new Set(cut.unset),
        writers: new Set(cut.writers),
      });
      cut.typedAfter = false;
      continue;
    }
    const target = getDefined(
      pieces[op.of === 'left' ? 0 : op.of === 'middle' ? 1 : pieces.length - 1]
    );
    if (op.kind === 'type' && op.after) target.typedAfter = true;
    else if (op.kind === 'set' || op.kind === 'unset') {
      const key = op.key ?? (liftBound.key as LiftKey);
      target.writers.add(op.by);
      if (op.kind === 'set') target.held.add(key);
      else {
        target.held.delete(key);
        target.unset.add(key);
      }
    } else target.done.add(op.kind);
  }
  return pieces;
};

// Every lift script splits the link `amb` once or twice, the second time by
// `s0` or, with --lift-enters=2, by another change, and then unwraps,
// empties or removes its pieces or, with --lift-writes, writes their key, by
// a change or, with --lift-edits=1, by an Editing author. The key is the url
// or, with --lift-key, a metadata note or the ref a split drops; with
// --lift-seed=1 the link starts with it and a change may unset it on a piece
// that holds it. Each piece takes each kind at most once, one write from each
// author, one unset, and nothing after its removal. The second split comes
// before any other operation or, with --lift-interleave=1, after any that
// leave the piece it cuts with writes only. A split cuts the link alone or,
// with --lift-enter=paragraph, is an Enter that cuts the paragraph too, and
// with --lift-enter=both it is either. With --lift-inserts=1 a change types
// one letter into a piece or into the empty text after a piece that another
// piece follows, each place once; a later operation may still empty or remove
// the piece that holds the letter. With --lift-place=1 the start document
// has a paragraph `p` before the link's, and only scripts in which one change
// joins the link's first paragraph into it run. With --lift-outside=1 the
// start document has a paragraph `q` after the link's last paragraph, and a
// change may remove `q`, type a letter into it and join it into the
// paragraph before it, each at most once and nothing after its removal; only
// scripts that do at least one of these run. Each counts as an operation.
// With --lift-outside=2 a paragraph `d` precedes `q` instead, and right
// after the first split a change removes `d` and then the Editing author
// joins `q` into it, which recording keeps as an Editing join claim the
// pending removal still resolves; only scripts with both run, neither counts
// as an operation, and no other operation touches `d` or `q`.
// With --lift-pair=1 the start document has the paragraph `q` after the
// link's paragraph and a paragraph holding a second link `cd` after `q`, and
// right after the first split, `s0` or another change splits `cd` after `c`
// in each way --lift-enter allows; only scripts with that split run, it
// counts as no operation, and the other operations may touch either link's
// pieces. --lift-pair=2 puts a paragraph `w` after `q`, so two plain
// paragraphs part the links, and with --lift-pair=3, right after the second
// link's split, `s0` or another change types `z` into `q`, so a pending
// suggestion joins the links; that too counts as no operation.
// With --lift-bridge=1 the plain paragraph `q` and a paragraph `r` follow
// the link's paragraph, and right after the first split `s0` or another
// change joins `r` into `q`, or the start holds one paragraph `qr` that
// such a change splits after `q` with an Enter. Then `s0` or another change
// centers `r`. Only scripts with both run, neither counts as an operation,
// and no other operation touches `q` or `r`.
// With --lift-quote=1 the
// first split names the quote the link's paragraph starts in, as its only,
// first or second paragraph, and a change may wrap the first paragraph
// holding the link in a quote, lift it out of its quote, unwrap the outer
// quote, or join the quote's other paragraph and the link's, each at most
// once. Each counts as an operation; nothing follows a lift, whose recording
// moves the paragraph, and no join follows a wrap, after which the link's
// paragraph is no longer the quote's. With --lift-outside=1, `q` follows
// the quote, and no operation on `q` follows its join, which recording
// writes as a move into the quote. Changes are labeled by first use, as in
// `pickings`.
function* liftScripts(): Generator<LiftOp[]> {
  const enters: ReadonlyArray<Readonly<{ enter?: 'paragraph' }>> =
    liftBound.enter === 'both'
      ? [{}, { enter: 'paragraph' }]
      : liftBound.enter === 'paragraph'
        ? [{ enter: 'paragraph' }]
        : [{}];
  const ops: LiftOp[] = [];
  function* extend(fresh: number): Generator<LiftOp[]> {
    const joined = ops.some((op) => op.kind === 'join');
    const outside = new Set(
      ops.flatMap((op) => (op.kind === 'outside' ? [op.does] : []))
    );
    const quoted = new Set(
      ops.flatMap((op) => (op.kind === 'quote' ? [op.does] : []))
    );
    const paired = ops.some((op) => op.kind === 'split' && onSecond(op));
    const between = ops.some((op) => op.kind === 'between');
    const bridged = new Set(
      ops.flatMap((op) => (op.kind === 'bridge' ? [op.does] : []))
    );
    if (
      (liftBound.bridge === 0 || bridged.has('center')) &&
      (liftBound.place === 0 || joined) &&
      (liftBound.outside === 0 ||
        (liftBound.outside === 1 ? outside.size > 0 : outside.has('join'))) &&
      (liftBound.pair === 0 || (paired && (liftBound.pair !== 3 || between)))
    ) {
      yield [...ops];
    }
    if (quoted.has('lift')) return;
    const pieces = piecesOf(ops);
    const twice = pieces.length === 3;
    const touched = ops.filter(
      (op) =>
        op.kind !== 'split' &&
        op.kind !== 'between' &&
        op.kind !== 'bridge' &&
        (op.kind !== 'outside' || liftBound.outside !== 2)
    ).length;
    const last = touched === liftBound.ops;
    const authors = Array.from(
      { length: Math.min(fresh + 1, liftBound.changes) },
      (_, at) => `s${at + 1}`
    );
    function* run(op: LiftOp) {
      ops.push(op);
      yield* extend(op.by === `s${fresh + 1}` ? fresh + 1 : fresh);
      ops.pop();
    }
    if (liftBound.pair > 0 && !paired) {
      for (const by of ['s0', ...authors]) {
        for (const enter of enters) {
          yield* run({ at: 1, by, ...enter, kind: 'split', second: true });
        }
      }
      return;
    }
    if (liftBound.pair === 3 && !between) {
      for (const by of ['s0', ...authors]) yield* run({ by, kind: 'between' });
      return;
    }
    if (liftBound.bridge === 1 && !bridged.has('center')) {
      const does =
        bridged.size === 0
          ? (['join', 'enter'] as const)
          : (['center'] as const);
      for (const by of ['s0', ...authors]) {
        for (const kind of does) yield* run({ by, does: kind, kind: 'bridge' });
      }
      return;
    }
    if (liftBound.outside === 2 && !outside.has('join')) {
      if (outside.has('strike')) {
        yield* run({ by: EDITING, does: 'join', kind: 'outside' });
      } else {
        for (const by of ['s0', ...authors]) {
          yield* run({ by, does: 'strike', kind: 'outside' });
        }
      }
      return;
    }
    if (last && liftBound.interleave === 0) return;
    const first = ops[0] as Extract<LiftOp, { kind: 'split' }>;
    if (
      !twice &&
      (touched === 0 ||
        (liftBound.interleave === 1 &&
          getDefined(pieces[first.at === 1 ? 1 : 0]).done.size === 0))
    ) {
      for (const by of ['s0', ...(liftBound.enters === 2 ? authors : [])]) {
        for (const enter of enters) {
          yield* run({
            at: first.at === 1 ? 2 : 1,
            by,
            ...enter,
            kind: 'split',
          });
        }
      }
    }
    if (last) return;
    const links = [
      {
        names: (twice
          ? ['left', 'middle', 'right']
          : ['left', 'right']) as readonly LiftPiece[],
        on: {},
        pieces,
      },
      ...(paired
        ? [
            {
              names: ['left', 'right'] as readonly LiftPiece[],
              on: { second: true } as const,
              pieces: piecesOf(ops, true),
            },
          ]
        : []),
    ];
    for (const by of authors) {
      for (const { names, on, pieces: cut } of links) {
        for (const [at, of] of names.entries()) {
          const { done } = getDefined(cut[at]);
          if (done.has('remove')) continue;
          for (const kind of ['unwrap', 'empty', 'remove'] as const) {
            if (!done.has(kind)) yield* run({ by, kind, of, ...on });
          }
        }
      }
    }
    if (liftBound.inserts === 1) {
      for (const by of authors) {
        for (const { names, on, pieces: cut } of links) {
          for (const [at, of] of names.entries()) {
            const piece = getDefined(cut[at]);
            if (!piece.done.has('remove') && !piece.done.has('type')) {
              yield* run({ by, kind: 'type', of, ...on });
            }
            if (at < names.length - 1 && !piece.typedAfter) {
              yield* run({ after: true, by, kind: 'type', of, ...on });
            }
          }
        }
      }
    }
    if (liftBound.quote === 1) {
      for (const by of authors) {
        for (const does of ['wrap', 'lift', 'unwrap', 'join'] as const) {
          if (
            !quoted.has(does) &&
            (does !== 'join' || (first.in !== 'only' && !quoted.has('wrap')))
          ) {
            yield* run({ by, does, kind: 'quote' });
          }
        }
      }
    }
    if (liftBound.place === 1 && !joined) {
      for (const by of authors) yield* run({ by, kind: 'join' });
    }
    if (
      liftBound.outside === 1 &&
      !outside.has('remove') &&
      (liftBound.quote === 0 || !outside.has('join'))
    ) {
      for (const by of authors) {
        for (const does of ['remove', 'type', 'join'] as const) {
          if (!outside.has(does)) yield* run({ by, does, kind: 'outside' });
        }
      }
    }
    const writes = ops.filter(
      (op) => op.kind === 'set' || op.kind === 'unset'
    ).length;
    if (writes === liftBound.writes) return;
    const keys: readonly LiftKey[] =
      liftBound.key === 'mixed' ? ['ref', 'note'] : [liftBound.key];
    for (const by of liftBound.edits === 1 ? [...authors, EDITING] : authors) {
      for (const { names, on, pieces: cut } of links) {
        for (const [at, of] of names.entries()) {
          const piece = getDefined(cut[at]);
          if (piece.done.has('remove') || piece.writers.has(by)) continue;
          for (const key of keys) {
            const keyed = liftBound.key === 'mixed' ? { key } : {};
            yield* run({
              by,
              ...keyed,
              kind: 'set',
              of,
              value: `v${writes + 1}`,
              ...on,
            });
            if (
              liftBound.seed === 1 &&
              by !== EDITING &&
              piece.held.has(key) &&
              !piece.unset.has(key)
            ) {
              yield* run({ by, ...keyed, kind: 'unset', of, ...on });
            }
          }
        }
      }
    }
  }
  const quotes: ReadonlyArray<Readonly<{ in?: LiftQuote }>> =
    liftBound.quote === 1
      ? [{ in: 'only' }, { in: 'first' }, { in: 'second' }]
      : [{}];
  for (const at of [1, 2] as const) {
    for (const enter of enters) {
      for (const quote of quotes) {
        ops.push({ at, by: 's0', ...enter, ...quote, kind: 'split' });
        yield* extend(0);
        ops.pop();
      }
    }
  }
}

const QUOTE_STORY = {
  join: "joins the quote's paragraphs",
  lift: "lifts the link's paragraph",
  unwrap: 'unwraps the quote',
  wrap: "wraps the link's paragraph",
} as const;

const liftStory = (op: LiftOp) => {
  if (op.kind === 'split') {
    const where = op.in ? ` in a quote's ${op.in} paragraph` : '';
    return `${op.by} ${op.enter === 'paragraph' ? 'enters' : 'splits'} after ${(op.second ? 'cd' : 'amb')[op.at - 1]}${where}`;
  }
  if (op.kind === 'join') return `${op.by} joins the link's paragraph into p`;
  if (op.kind === 'between') return `${op.by} types z into q`;
  if (op.kind === 'bridge') {
    return `${op.by} ${{ center: 'centers r', enter: 'enters after q', join: 'joins r into q' }[op.does]}`;
  }
  if (op.kind === 'quote') return `${op.by} ${QUOTE_STORY[op.does]}`;
  if (op.kind === 'outside') {
    if (op.does === 'strike') return `${op.by} removes d`;
    if (op.by === EDITING) return 'editing joins q into d';
    return op.does === 'join'
      ? `${op.by} joins q into the paragraph before it`
      : `${op.by} ${op.does === 'type' ? 'types z into' : 'removes'} q`;
  }
  const piece = op.second ? `second ${op.of}` : op.of;
  if (op.kind === 'type') {
    return `${op.by} types x ${op.after ? 'after' : 'into'} ${piece}`;
  }
  const key = op.kind !== 'set' && op.kind !== 'unset' ? '' : (op.key ?? '');
  const of = key ? `${piece} ${key}` : piece;
  if (op.kind === 'set') {
    return `${op.by === EDITING ? 'editing' : op.by} sets ${of} ${op.value}`;
  }
  return `${op.by} ${op.kind === 'empty' ? 'empties' : `${op.kind}s`} ${of}`;
};

// A lift walk also reads the changes a reviewer still reads as pending, so
// a step that leaves review in one order only fails, and follows each order
// on one editor.
const givebackWalk = (
  script: ReadonlyArray<Readonly<{ by: string }>>,
  start: unknown,
  name = (script as readonly GivebackOp[]).map(opStory).join(', '),
  lift = false
): Walk<unknown> => {
  const proposers = new Set(
    script.flatMap((op) => (op.by === EDITING ? [] : [op.by]))
  );
  const pending = changesIn(start as Doc).filter((change) =>
    proposers.has(change)
  );
  const outcomeOf = <State>(
    result: AuthoredResult,
    state: State,
    decided: ReadonlyMap<string, Verdict>
  ): Outcome<State> => {
    const admission = decisionAdmission(result, decided, pending);
    return admission.kind === 'settles'
      ? { kind: 'settled', state }
      : admission;
  };
  const shownOf = (value: unknown, waiting?: readonly string[]) => {
    const seen = givebackRead(value);
    const shown = `${story(seen.children)} landed [${seen.landed}]`;
    return waiting
      ? {
          seen: { pending: waiting, reader: seen },
          shown: `${shown} pending [${waiting.join(', ')}]`,
        }
      : { seen, shown };
  };
  const reads = new WeakMap<object, ReturnType<typeof shownOf>>();
  type Reviewer = ReturnType<typeof givebackEditor>;
  const begun = new WeakMap<object, Reviewer>();
  const continued: Continued<Reviewer> = {
    begun: (state) => {
      const live = begun.get(state as object);
      begun.delete(state as object);
      return live;
    },
    open: () => givebackEditor(start),
    read: (live) => shownOf(live.read.value(), pendingIn(live)),
    step: (live, decided, deciding) => {
      const { result } = decideIn(live, deciding);
      return outcomeOf(result, live, decided);
    },
  };
  return {
    ...(lift ? { continued: continued as Continued<unknown> } : {}),
    name,
    pending,
    read: (state) => {
      const known = reads.get(state as object);
      if (known) return known;
      const made = shownOf(state, lift ? pendingRead(state) : undefined);
      reads.set(state as object, made);
      return made;
    },
    same: withoutTokens,
    start,
    step: (state, decided, deciding) => {
      const loaded = givebackEditor(state, givebackIds);
      const generatedBefore = idGeneratorCalls.count;
      const { result, value } = decideIn(loaded, deciding);
      const made = idGeneratorCalls.count - generatedBefore;
      if (made > 0) {
        return {
          kind: 'refused',
          reason: `calls the id generator ${made} times`,
        };
      }
      const outcome = outcomeOf(result, value, decided);
      if (lift && decided.size === 0 && outcome.kind === 'settled') {
        begun.set(value, loaded);
      }
      return outcome;
    },
  };
};

// Scripts share prefixes, so a worker records each prefix once.
const prefixes = new Map<string, unknown>();

// A script whose operation throws, or leaves the children and their marks as
// they were, models a write recording never makes.
const recorded = <Op>(
  script: readonly Op[],
  start: unknown = givebackStart(givebackIds),
  record = ((value: unknown, op: GivebackOp, at: number) =>
    recordGiveback(value, op, at, givebackIds)) as (
    value: unknown,
    op: Op,
    at: number
  ) => unknown,
  tell = opStory as (op: Op) => string
) => {
  let value: unknown = start;
  // A bridge script's start depends on a later operation, so the start is
  // part of the key.
  const from = JSON.stringify(start);
  for (const [at, op] of script.entries()) {
    const prefix = `${from} ${JSON.stringify(script.slice(0, at + 1))}`;
    const known = prefixes.get(prefix);
    if (known !== undefined) {
      value = known;
      continue;
    }
    let next: unknown;
    try {
      next = record(value, op, at);
    } catch (error) {
      return `${tell(op)} throws ${(error as Error).message}`;
    }
    if (
      isDeepStrictEqual(
        (next as { children: unknown }).children,
        (value as { children: unknown }).children
      )
    ) {
      return `${tell(op)} changes nothing`;
    }
    prefixes.set(prefix, next);
    value = next;
  }
  return { value };
};

const summed = (results: ReadonlyArray<ReturnType<typeof explore>>) => ({
  compared: results.reduce((sum, result) => sum + result.compared, 0),
  failures: results.flatMap((result) => result.failures),
  followed: results.reduce((sum, result) => sum + result.followed, 0),
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
} else if (shard === 'lift') {
  const items: LiftOp[][] = JSON.parse(await Bun.stdin.text());
  const unchecked: string[] = [];
  const results = items.flatMap((script) => {
    const outcome = recorded(
      script,
      liftStart({
        after: liftBound.outside > 0,
        apart: liftBound.pair === 2,
        before: liftBound.place === 1,
        ...(liftBound.bridge === 1
          ? {
              bridge: script.some(
                (op) => op.kind === 'bridge' && op.does === 'enter'
              )
                ? 'enter'
                : 'join',
            }
          : {}),
        key: liftBound.key === 'mixed' ? 'ref' : liftBound.key,
        pair: liftBound.pair > 0,
        quote: (script[0] as Extract<LiftOp, { kind: 'split' }>).in,
        seeded: liftBound.seed === 1,
        struck: liftBound.outside === 2,
      }),
      (value, op: LiftOp, at) =>
        recordLift(
          value,
          op,
          at,
          liftBound.key === 'mixed' ? 'ref' : liftBound.key
        ),
      liftStory
    );
    if (typeof outcome === 'string') {
      unchecked.push(outcome);
      return [];
    }
    return [
      explore(
        givebackWalk(
          script,
          outcome.value,
          script.map(liftStory).join(', '),
          true
        )
      ),
    ];
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
      followed: explored.reduce((sum, result) => sum + result.followed, 0),
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
      followed: 0,
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

  if (runs('lift')) {
    const started = performance.now();
    const written = [...liftScripts()].filter(
      (script, at) =>
        (onlyLift === undefined ||
          script.map(liftStory).join(', ') === onlyLift) &&
        at % liftParts === liftPart - 1
    );
    if (process.env.LIFT_LIST) {
      writeFileSync(
        process.env.LIFT_LIST,
        written.map((script) => script.map(liftStory).join(', ')).join('\n')
      );
      process.exit(0);
    }
    if (written.length === 0) {
      console.error(`No lift script in the bound reads ${onlyLift}.`);
      process.exit(2);
    }
    const result = gathered(await fanOut<Explored>('lift', written));
    found.set('lift', result);
    console.info(
      JSON.stringify({
        bound: liftBound,
        compared: result.compared,
        continued: result.followed,
        documents: written.length - result.unchecked.length,
        failures: result.failures.length,
        family: 'lift',
        idle: result.idle.length,
        seconds: seconds(started),
        together: result.together.length,
      })
    );
    if (result.unchecked.length > 0) {
      unchecked.push(
        `Of ${written.length} lift scripts, ${result.unchecked.length} do not record, such as ${result.unchecked[0]}. The generator writes an operation recording never makes, which leaves the property unchecked on those scripts.`
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
