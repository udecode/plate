import { writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { isDeepStrictEqual } from 'node:util';

import {
  enforceBaseline,
  readBaseline,
} from '../../../tooling/scripts/finding-baseline.mjs';
import { expandContexts } from '../src/authored/facts/compact';
import type { LandedRecord } from '../src/authored/facts/records';
import type { AuthoredMark } from '../src/authored/tree/marks';
import type { AuthoredResolution } from '../src/authored/tree/resolve';
import type { JsonNode } from '../src/core/change/tokens';
import {
  admissionOf,
  all,
  type Block2,
  decideGiveback,
  decisionAdmission,
  EDITING,
  type GivebackOp,
  givebackRead,
  givebackStart,
  LANDED,
  type LinkHalf,
  generatedQuotesEditor,
  generatedQuotesSchema,
  quotesEditor,
  quotesSchema,
  recordGiveback,
  resolveWithVerdicts,
  settleAsAdmission,
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
  | 'insert'
  | 'join'
  | 'move'
  | 'split'
  | 'unwrap'
  | 'wrap';
type Choice = { change: string; option: Option } | undefined;
type Node = {
  align?: string;
  authored?: AuthoredMark[];
  children?: Node[];
  id?: string;
  text?: string;
  type?: string;
};
type Failure = { detail: string; identity: string };
type Family = (typeof FAMILIES)[number];

const BOUNDARY: readonly Option[] = ['join', 'split'];
const CONTENT: readonly Option[] = ['delete', 'insert'];
// A suggested move strikes the block and inserts a copy with its values under
// the same change; only generated ids tell the copy from new content.
const MOVABLE: readonly Option[] = [...CONTENT, 'move'];
const ENCLOSURE: readonly Option[] = ['unwrap', 'wrap'];
const FORMAT: readonly Option[] = ['align', 'align-center'];

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
const schemaFlag = flag('schema') ?? 'plain';
if (schemaFlag !== 'plain' && schemaFlag !== 'generated') {
  console.error('--schema takes plain or generated.');
  process.exit(2);
}
// Every element of a generated document has an id, which a decision may only
// take from stored content.
const generatedIds = schemaFlag === 'generated';
const quotes = generatedIds
  ? { editor: generatedQuotesEditor, schema: generatedQuotesSchema }
  : { editor: quotesEditor, schema: quotesSchema };
// Takes a script's name as a failure prints it, to rerun that script alone
// within the bound.
const onlyScript = flag('giveback-script');
const atGate =
  family === undefined &&
  !generatedIds &&
  onlyScript === undefined &&
  isDeepStrictEqual(bound, GATE) &&
  isDeepStrictEqual(givebackBound, GIVEBACK_GATE);

function* shapes(): Generator<number[]> {
  for (let count = 1; count <= bound.blocks; count++) {
    for (let code = 0; code < 3 ** count; code++) {
      yield Array.from(
        { length: count },
        (_, index) => Math.floor(code / 3 ** index) % 3
      );
    }
  }
}

// The places a recorded change can mark, in document order: a block's
// boundary with the block before it, its whole content, a quote's enclosure
// and align tag, and each paragraph's one leaf.
const slotsOf = (shape: readonly number[]) =>
  shape.flatMap((block, index) => {
    const paragraph = (first: boolean) => [
      ...(first ? [] : [BOUNDARY]),
      generatedIds ? MOVABLE : CONTENT,
      CONTENT,
    ];
    if (block === 0) return paragraph(index === 0);
    return [
      ...(index === 0 ? [] : [BOUNDARY]),
      CONTENT,
      ENCLOSURE,
      FORMAT,
      ...Array.from({ length: block }, (_, inner) =>
        paragraph(inner === 0)
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

const alignTag = (change: string) =>
  ({
    at: 1,
    author: change,
    change,
    id: `align0${change}`,
    key: 'align',
    kind: 'format',
    write: { kind: 'set', value: 'center' },
  }) as AuthoredMark;

const insertedBy = (node: Node, change: string) =>
  node.authored?.some(
    (item) => item.change === change && item.kind === 'insert'
  ) ?? false;

const build = (shape: readonly number[], picks: readonly Choice[]) => {
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
  const copies: Node[] = [];
  let unrecorded = false;
  const paragraph = (first: boolean) => {
    const boundary = first ? undefined : next();
    const pick = take();
    const leaf = next();
    const text = String.fromCharCode(97 + letter);
    letter += 1;
    const id = generatedIds ? { id: `p${text}` } : {};
    if (pick?.option === 'move') {
      unrecorded ||= leaf !== undefined;
      copies.push(
        withMarksOf({ type: 'paragraph', ...id, children: [{ text }] }, [
          { change: pick.change, kind: 'insert' },
        ])
      );
    }
    const content = pick && {
      change: pick.change,
      kind: (pick.option === 'move'
        ? 'delete'
        : pick.option) as AuthoredMark['kind'],
    };
    return withMarksOf(
      { type: 'paragraph', ...id, children: [withMarksOf({ text }, [leaf])] },
      [boundary, content]
    );
  };

  const blocks = shape.map((block, index): Node | null => {
    if (block === 0) return paragraph(index === 0);
    const boundary = index === 0 ? undefined : next();
    const content = next();
    const enclosure = next();
    const format = take();
    const children = Array.from({ length: block }, (_, inner) =>
      paragraph(inner === 0)
    );
    const quote: Node = withMarksOf(
      { type: 'quote', ...(generatedIds ? { id: `q${index}` } : {}), children },
      [boundary, content, enclosure]
    );
    if (!format) return quote;
    if (insertedBy(quote, format.change)) return null;
    return {
      ...quote,
      ...(format.option === 'align-center' ? { align: 'center' } : {}),
      authored: [...(quote.authored ?? []), alignTag(format.change)],
    };
  });
  // The recorder lands a moved block's copy where it goes, here the end, and
  // a copy of a leaf another change marks is not one it writes.
  return unrecorded ? [null] : [...blocks, ...copies];
};

// Links a cut adds get ids too, since a generated id is on every element.
const withIds = (nodes: readonly Node[]) => {
  let count = 0;
  const visit = (node: Node): Node =>
    node.text === undefined
      ? {
          ...node,
          ...(node.id ? {} : { id: `n${(count += 1)}` }),
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

const generate = () => {
  const documents = new Map<string, readonly Node[]>();
  for (let marks = 1; marks <= bound.marks; marks++) {
    for (const shape of shapes()) {
      for (const picks of pickings(slotsOf(shape), marks)) {
        const blocks = build(shape, picks);
        if (blocks.includes(null)) continue;
        for (const flags of cutFlags(blocks as Block2[])) {
          const cut = withCuts(blocks as Block2[], flags) as Node[];
          const document = generatedIds ? withIds(cut) : cut;
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
    .map(([key, value]) => `[${key} ${value}]`)
    .join('');
  return `${type}${props}${own}(${children.map(describe).join(' ')})`;
};
const story = (nodes: readonly unknown[]) =>
  (nodes as Node[]).map(describe).join(' ');

const changesIn = (nodes: readonly Node[]) => {
  const found = new Set<string>();
  const walk = (node: Node) => {
    for (const item of node.authored ?? []) found.add(item.change);
    for (const child of node.children ?? []) walk(child);
  };
  for (const node of nodes) walk(node);
  return [...found].sort();
};

const normalize = (generated: readonly Node[]) => {
  try {
    return JSON.stringify(
      expandContexts(quotes.editor(generated).read.value()).children
    );
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
    failures,
    idle: pending.length > 1 && compared === 0 ? [walk.name] : [],
    together,
  };
};

type QuotesState = Readonly<{
  children: readonly JsonNode[];
  landed: readonly LandedRecord[];
}>;

const quotesWalk = (
  generated: readonly Node[],
  document: readonly JsonNode[]
): Walk<QuotesState> => {
  const pending = changesIn(document as Node[]);
  const outcomeOf = (
    result: AuthoredResolution,
    decided: ReadonlyMap<string, Verdict>,
    deciding: ReadonlyMap<string, Verdict>,
    landed: readonly LandedRecord[]
  ): Outcome<QuotesState> => {
    const admission = admissionOf(result, decided, deciding, pending);
    if (admission.kind !== 'settles') return admission;
    const now = new Map([...decided, ...deciding]);
    return {
      kind: 'settled',
      state: settleAsAdmission(now, result, landed, quotes.schema),
    };
  };
  return {
    name: story(generated),
    pending,
    read: ({ children, landed }) => {
      const writes = writesOf(landed, children);
      return {
        seen: { children, landed: writes },
        shown: `${story(children)} landed [${writes}]`,
      };
    },
    start: { children: document, landed: LANDED },
    step: (state, decided, deciding) => {
      const generatedBefore = idGeneratorCalls.count;
      const outcome = outcomeOf(
        resolveWithVerdicts(
          decided,
          state.children,
          all(deciding),
          quotes.schema,
          state.landed
        ),
        decided,
        deciding,
        state.landed
      );
      const made = idGeneratorCalls.count - generatedBefore;
      if (made === 0) return outcome;
      return {
        kind: 'refused',
        reason: `calls the id generator ${made} times`,
      };
    },
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
  const pending = changesIn((start as { children: Node[] }).children).filter(
    (change) => proposers.has(change)
  );
  const outcomeOf = (
    { result, value }: ReturnType<typeof decideGiveback>,
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
    // Each call stores a fresh random token that only groups the verdicts it
    // decided, so states that differ in tokens alone decide alike.
    same: (state) =>
      JSON.stringify(state).replaceAll(/[0-9a-f]{8}:\d+/g, 'decision'),
    start,
    step: (state, decided, deciding) =>
      outcomeOf(decideGiveback(state, deciding), decided),
  };
};

// Scripts share prefixes, so a worker records each prefix once.
const prefixes = new Map<string, unknown>();

// A script whose operation throws, or leaves the children and their marks as
// they were, models a write recording never makes.
const recorded = (script: readonly GivebackOp[]) => {
  let value: unknown = givebackStart();
  for (const [at, op] of script.entries()) {
    const prefix = JSON.stringify(script.slice(0, at + 1));
    const known = prefixes.get(prefix);
    if (known !== undefined) {
      value = known;
      continue;
    }
    let next: unknown;
    try {
      next = recordGiveback(value, op, at);
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

if (shard === 'normalize') {
  const items: Array<[number, Node[]]> = JSON.parse(await Bun.stdin.text());
  console.log(
    JSON.stringify(
      items.map(([index, generated]) => [index, normalize(generated)])
    )
  );
} else if (shard === 'explore') {
  const items: Array<[Node[], JsonNode[]]> = JSON.parse(await Bun.stdin.text());
  console.log(
    JSON.stringify({
      ...summed(
        items.map(([generated, document]) =>
          explore(quotesWalk(generated, document))
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
  const fanOut = async <T>(role: string, items: readonly unknown[]) =>
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
            env: { ...process.env, AUTHORED_ORDER_SHARD: role },
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
    const started = performance.now();
    const generated = generate();
    const shards = await fanOut<Array<[number, string | null]>>(
      'normalize',
      generated.map((document, index) => [index, document])
    );
    const normalized = shards.flat().sort(([a], [b]) => a - b);
    const unique = new Map<string, [Node[], JsonNode[]]>();
    for (const [index, document] of normalized) {
      if (document !== null && !unique.has(document)) {
        unique.set(document, [
          generated[index] as Node[],
          JSON.parse(document),
        ]);
      }
    }
    const result = gathered(
      await fanOut<Explored>('explore', [...unique.values()])
    );
    found.set('quotes', result);
    console.info(
      JSON.stringify({
        bound,
        compared: result.compared,
        documents: unique.size,
        failures: result.failures.length,
        family: 'quotes',
        generated: generated.length,
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
        `Of ${generated.length} generated documents, ${normalized.length} came back from the workers, ${rejected.length} fail to load in the quotes editor, ${merged} normalize to a document another one gives, and ${result.idle.length} with two or more changes have no order the script could compare. Either the generator builds a shape recording never writes, or the editor or resolver now refuses or rewrites documents and decisions it accepted, which leaves the property unchecked on those documents.`
      );
    }
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
    const result = gathered(await fanOut<Explored>('giveback', written));
    found.set('giveback', result);
    console.info(
      JSON.stringify({
        bound: givebackBound,
        compared: result.compared,
        documents: written.length - result.unchecked.length,
        failures: result.failures.length,
        family: 'giveback',
        idle: result.idle.length,
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
