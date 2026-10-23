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
  LANDED,
  quotesEditor,
  quotesSchema,
  resolveWithVerdicts,
  settleAsAdmission,
  type Verdict,
  withCuts,
  withMarksOf,
  writesOf,
} from '../test/support/authored-laws';

const BASELINE =
  'packages/plitejs/scripts/authored-decision-order-baseline.json';
const RULE = 'decision-order';
const TOGETHER = 'decided-together';
const OWNER = 'packages/plitejs/src/authored/tree/resolve.ts';
const GATE = { blocks: 2, changes: 2, marks: 2 };

type Option =
  | 'align'
  | 'align-center'
  | 'delete'
  | 'insert'
  | 'join'
  | 'split'
  | 'unwrap'
  | 'wrap';
type Choice = { change: string; option: Option } | undefined;
type Node = {
  align?: string;
  authored?: AuthoredMark[];
  children?: Node[];
  text?: string;
  type?: string;
};
type Failure = { detail: string; identity: string };

const BOUNDARY: readonly Option[] = ['join', 'split'];
const CONTENT: readonly Option[] = ['delete', 'insert'];
const ENCLOSURE: readonly Option[] = ['unwrap', 'wrap'];
const FORMAT: readonly Option[] = ['align', 'align-center'];

const stray = process.argv
  .slice(2)
  .filter(
    (arg) => !/^--(?:(?:blocks|changes|jobs|marks)=.*|init|lower)$/.test(arg)
  );
if (stray.length > 0) {
  console.error(
    `Unknown arguments: ${stray.join(' ')}. A bound flag takes the form --marks=3.`
  );
  process.exit(2);
}

const flag = (name: string) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
const wholeFlag = (name: string, fallback: number) => {
  const value = Number(flag(name) ?? fallback);
  if (!Number.isInteger(value) || value < 1) {
    console.error(`--${name} takes a whole number above 0.`);
    process.exit(2);
  }
  return value;
};
const bound = {
  blocks: wholeFlag('blocks', GATE.blocks),
  changes: wholeFlag('changes', GATE.changes),
  marks: wholeFlag('marks', GATE.marks),
};
const atGate = isDeepStrictEqual(bound, GATE);

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
      CONTENT,
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
  const paragraph = (first: boolean) => {
    const boundary = first ? undefined : next();
    const content = next();
    const leaf = next();
    const text = String.fromCharCode(97 + letter);
    letter += 1;
    return withMarksOf(
      { type: 'paragraph', children: [withMarksOf({ text }, [leaf])] },
      [boundary, content]
    );
  };

  return shape.map((block, index): Node | null => {
    if (block === 0) return paragraph(index === 0);
    const boundary = index === 0 ? undefined : next();
    const content = next();
    const enclosure = next();
    const format = take();
    const children = Array.from({ length: block }, (_, inner) =>
      paragraph(inner === 0)
    );
    const quote: Node = withMarksOf({ type: 'quote', children }, [
      boundary,
      content,
      enclosure,
    ]);
    if (!format) return quote;
    if (insertedBy(quote, format.change)) return null;
    return {
      ...quote,
      ...(format.option === 'align-center' ? { align: 'center' } : {}),
      authored: [...(quote.authored ?? []), alignTag(format.change)],
    };
  });
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
          const document = withCuts(blocks as Block2[], flags) as Node[];
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
  const align = node.align ? `[align ${node.align}]` : '';
  return `${node.type}${align}${own}(${(node.children ?? []).map(describe).join(' ')})`;
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
      expandContexts(quotesEditor(generated).read.value()).children
    );
  } catch {
    return null;
  }
};

type Outcome =
  | Readonly<{
      children: readonly JsonNode[];
      kind: 'settled';
      landed: readonly LandedRecord[];
    }>
  | Readonly<{ kind: 'refused'; reason: string }>
  | Readonly<{ kind: 'waits' }>;

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

const explore = (generated: readonly Node[], document: readonly JsonNode[]) => {
  const failures: Failure[] = [];
  const pending = changesIn(document as Node[]);
  const outcomeOf = (
    result: AuthoredResolution,
    decided: ReadonlyMap<string, Verdict>,
    deciding: ReadonlyMap<string, Verdict>,
    landed: readonly LandedRecord[]
  ): Outcome => {
    const admission = admissionOf(result, decided, deciding, pending);
    if (admission.kind !== 'settles') return admission;
    const now = new Map([...decided, ...deciding]);
    return {
      kind: 'settled',
      ...settleAsAdmission(now, result, landed, quotesSchema),
    };
  };
  const atOnce = new Map<string, Outcome>();
  const reached = new Set<string>();
  let compared = 0;
  const atOnceOf = (decisions: ReadonlyMap<string, Verdict>) => {
    const key = keyOf(decisions);
    const cached = atOnce.get(key);
    if (cached) return cached;
    const resolved = resolveWithVerdicts(
      new Map(),
      document,
      all(decisions),
      quotesSchema
    );
    const outcome = outcomeOf(resolved, new Map(), decisions, LANDED);
    atOnce.set(key, outcome);
    return outcome;
  };
  const descend = (
    decided: ReadonlyMap<string, Verdict>,
    order: readonly string[],
    stepped: readonly JsonNode[],
    landed: readonly LandedRecord[],
    reporting: boolean
  ) => {
    for (const change of pending) {
      if (decided.has(change)) continue;
      for (const verdict of ['accept', 'reject'] as const) {
        const deciding = new Map([[change, verdict]]);
        const step = resolveWithVerdicts(
          decided,
          stepped,
          all(deciding),
          quotesSchema,
          landed
        );
        const steps = [...order, `${verdict} ${change}`];
        const identity = `${story(generated)}: ${steps.join(', ')}`;
        const now = new Map(decided).set(change, verdict);
        const outcome = outcomeOf(step, decided, deciding, landed);
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
        reached.add(keyOf(now));
        const next = (reports: boolean) =>
          descend(now, steps, outcome.children, outcome.landed, reports);
        const decidesAlone = order.length === 0;
        if (!reporting || decidesAlone) {
          next(reporting);
          continue;
        }
        const expected = atOnceOf(now);
        if (expected.kind === 'waits') {
          next(true);
          continue;
        }
        compared += 1;
        const actual = writesOf(outcome.landed, outcome.children);
        const told = `  one at a time: ${story(outcome.children)} landed [${actual}]`;
        if (expected.kind === 'refused') {
          failures.push({
            detail: `${told}\n  all at once:   ${expected.reason}`,
            identity,
          });
          next(false);
          continue;
        }
        const wanted = writesOf(expected.landed, expected.children);
        if (
          !isDeepStrictEqual(
            { children: outcome.children, landed: actual },
            { children: expected.children, landed: wanted }
          )
        ) {
          failures.push({
            detail: `${told}\n  all at once:   ${story(expected.children)} landed [${wanted}]`,
            identity,
          });
          next(false);
          continue;
        }
        next(true);
      }
    }
  };
  descend(new Map(), [], document, LANDED, true);

  const together: string[] = [];
  for (const decisions of verdictSets(pending)) {
    if (reached.has(keyOf(decisions))) continue;
    const identity = `${story(generated)}: ${keyOf(decisions)}`;
    const outcome = atOnceOf(decisions);
    if (outcome.kind === 'settled') together.push(identity);
    if (outcome.kind === 'refused') {
      failures.push({
        detail: `  all at once:   ${outcome.reason}, and no order reaches these verdicts`,
        identity: `${identity} at once`,
      });
    }
  }
  return {
    compared,
    failures,
    idle: pending.length > 1 && compared === 0,
    together,
  };
};

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
  const results = items.map(([generated, document]) =>
    explore(generated, document)
  );
  console.log(
    JSON.stringify({
      compared: results.reduce((sum, result) => sum + result.compared, 0),
      failures: results.flatMap((result) => result.failures),
      idle: results.filter((result) => result.idle).length,
      together: results.flatMap((result) => result.together),
    })
  );
} else {
  const started = performance.now();
  const jobs = wholeFlag('jobs', availableParallelism());
  const fanOut = async <T>(role: string, items: readonly unknown[]) =>
    Promise.all(
      Array.from({ length: jobs }, async (_, index) => {
        const child = Bun.spawn(
          [process.execPath, ...process.execArgv, process.argv[1]],
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
          throw new Error(`${role} shard ${index} exited ${child.exitCode}`);
        }
        return JSON.parse(output.trim().split('\n').at(-1) ?? '') as T;
      })
    );

  const generated = generate();
  const shards = await fanOut<Array<[number, string | null]>>(
    'normalize',
    generated.map((document, index) => [index, document])
  );
  const normalized = shards.flat().sort(([a], [b]) => a - b);
  const unique = new Map<string, [Node[], JsonNode[]]>();
  for (const [index, document] of normalized) {
    if (document !== null && !unique.has(document)) {
      unique.set(document, [generated[index] as Node[], JSON.parse(document)]);
    }
  }
  const explored = await fanOut<{
    compared: number;
    failures: Failure[];
    idle: number;
    together: string[];
  }>('explore', [...unique.values()]);
  const failures = explored
    .flatMap((result) => result.failures)
    .sort((a, b) => a.identity.localeCompare(b.identity));
  const together = explored.flatMap((result) => result.together).sort();
  const compared = explored.reduce((sum, result) => sum + result.compared, 0);
  const idle = explored.reduce((sum, result) => sum + result.idle, 0);
  const rejected = normalized.filter(([, document]) => document === null);
  const merged = normalized.length - rejected.length - unique.size;
  console.info(
    JSON.stringify({
      bound,
      compared,
      documents: unique.size,
      failures: failures.length,
      generated: generated.length,
      seconds: Math.round((performance.now() - started) / 100) / 10,
      together: together.length,
    })
  );

  if (
    rejected.length > 0 ||
    merged > 0 ||
    normalized.length < generated.length ||
    idle > 0
  ) {
    console.error(
      `Of ${generated.length} generated documents, ${normalized.length} came back from the workers, ${rejected.length} fail to load in the quotes editor, ${merged} normalize to a document another one gives, and ${idle} with two or more changes have no order the script could compare. Either the generator builds a shape recording never writes, or the editor or resolver now refuses or rewrites documents and decisions it accepted, which leaves the property unchecked on those documents.`
    );
    process.exit(1);
  }

  const show = (identities: ReadonlySet<string>) => {
    for (const failure of failures.filter((item) =>
      identities.has(item.identity)
    )) {
      console.error(`\n${failure.identity}\n${failure.detail}`);
    }
  };

  if (atGate) {
    const found = {
      [RULE]: { [OWNER]: failures.map((failure) => failure.identity) },
      [TOGETHER]: { [OWNER]: together },
    };
    const known = readBaseline(BASELINE);
    const listed = new Set<string>(known[RULE]?.[OWNER]);
    show(
      new Set(
        failures
          .map((failure) => failure.identity)
          .filter((identity) => !listed.has(identity))
      )
    );
    const coupled = new Set<string>(known[TOGETHER]?.[OWNER]);
    for (const identity of together.filter((item) => !coupled.has(item))) {
      console.error(
        `\n${identity}\n  settles when decided together, while every order of single steps waits`
      );
    }
    process.exitCode = enforceBaseline({
      file: BASELINE,
      found,
      lowerCommand: 'pnpm check:authored-order --lower',
      mode: process.argv.includes('--lower')
        ? 'lower'
        : process.argv.includes('--init')
          ? 'init'
          : 'check',
      newFindingsHelp: `A ${RULE} entry decides its changes one at a time and gets another document than deciding them at once, or the resolver refuses a step no other pending change holds. A ${TOGETHER} entry settles only when its verdicts are decided at once, so no order checks it, and a resolver change that adds such a wait can hide a ${RULE} failure. Fix the resolver; the baseline never grows.`,
      rules: [RULE, TOGETHER],
    });
  } else {
    show(new Set(failures.map((failure) => failure.identity)));
    process.exitCode = failures.length > 0 ? 1 : 0;
  }
}
