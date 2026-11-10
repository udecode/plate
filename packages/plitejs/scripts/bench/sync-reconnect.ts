import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import {
  createEffectLedger,
  type Verdict,
  viewOfChange,
} from '../../src/core/change/effect-ledger';
import { editorCommands } from '../../src/core/editor-commands';
import {
  createEditor,
  defineEditorSchema,
  DocumentChange,
  type EditorDocumentValue,
  type Value,
  schema,
} from '../../src/index';

type Doc = EditorDocumentValue;
type Pattern = 'region' | 'sparse';
type Mode = 'budget' | 'composed' | 'stepwise';
type Cohort = Readonly<{
  blocks: number;
  missed: number;
  name: string;
  pattern: Pattern;
  pending: number;
}>;
type Reconnect = Readonly<{
  cells: number;
  head: Doc;
  rebased: readonly DocumentChange[];
}>;
type Reference = Record<
  string,
  Readonly<{ installed: string; rebased: readonly string[] }>
>;

const BUDGET_MS = 2000;
const REGION_WIDTH = 10;
const COHORTS: readonly Cohort[] = [200, 2000].flatMap((blocks) =>
  (['sparse', 'region'] as const).map((pattern) => ({
    blocks,
    missed: 100,
    name: `${pattern}-${blocks}`,
    pattern,
    pending: 100,
  }))
);

const Blocks = defineEditorSchema('schema:sync-reconnect-bench', {
  elements: { paragraph: { content: schema.content.text() } },
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});
const open = (value: Doc) =>
  createEditor<Value, readonly unknown[]>({
    initialValue: value,
    plugins: [Blocks],
  });

const random = (seed: number) => {
  let state = seed | 0;

  return () => {
    state = (state + 0x6d_2b_79_f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);

    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const baseDocument = (blocks: number): Doc =>
  open({
    children: Array.from({ length: blocks }, (_, at) => ({
      children: [{ text: `line ${at} lorem ipsum dolor sit amet` }],
      type: 'paragraph',
    })),
  }).read.value();

const queue = (
  base: Doc,
  cohort: Cohort,
  count: number,
  letter: string,
  seed: number
) => {
  const editor = open(base);
  const next = random(seed);
  const changes: DocumentChange[] = [];

  while (changes.length < count) {
    const { children } = editor.read.value();
    const from =
      cohort.pattern === 'sparse' ? 0 : Math.floor(cohort.blocks / 2);
    const width = cohort.pattern === 'sparse' ? children.length : REGION_WIDTH;
    const line = from + Math.floor(next() * width);
    const { text } = children[line].children[0];
    const offset = Math.floor(next() * (text.length + 1));
    const roll = next();
    const before = editor.read.lastCommit();

    editor.update((tx) => {
      const caret = { offset, path: [line, 0] };

      tx.selection.set({ anchor: caret, focus: caret });
      if (roll < 0.85) tx.command(editorCommands.insertText, { text: letter });
      else if (roll < 0.95) tx.command(editorCommands.insertBreak);
      else {
        tx.command(editorCommands.delete, {
          direction: 'backward',
          unit: 'character',
        });
      }
    });
    const commit = editor.read.lastCommit();

    if (commit && commit !== before) changes.push(commit.changes);
  }

  return changes;
};

const stepwise = (
  base: Doc,
  pending: readonly DocumentChange[],
  missed: readonly DocumentChange[]
): Reconnect => {
  let rebased = pending;
  let head = base;
  let cells = 0;

  for (const server of missed) {
    let over = server;
    let at = head;
    const next: DocumentChange[] = [];

    for (const change of rebased) {
      const transformed = DocumentChange.transform(change, over, at);

      cells += 1;
      at = change.apply(at);
      next.push(transformed.a);
      over = transformed.b;
    }
    rebased = next;
    head = server.apply(head);
  }

  return { cells, head, rebased };
};

const composed = (
  base: Doc,
  pending: readonly DocumentChange[],
  missed: readonly DocumentChange[]
): Reconnect => {
  let over = missed[0];

  for (const server of missed.slice(1)) over = over.compose(server, base);
  const head = over.apply(base);
  let at = base;
  let cells = 0;
  const rebased: DocumentChange[] = [];

  for (const change of pending) {
    const transformed = DocumentChange.transform(change, over, at);

    cells += 1;
    at = change.apply(at);
    rebased.push(transformed.a);
    over = transformed.b;
  }

  return { cells, head, rebased };
};

const REBASE: Record<Exclude<Mode, 'budget'>, typeof stepwise> = {
  composed,
  stepwise,
};

const judgeReconnect = (
  base: Doc,
  pending: readonly DocumentChange[],
  missed: readonly DocumentChange[],
  { rebased }: Reconnect,
  emptyLast: boolean
): Verdict => {
  const ledger = createEffectLedger(base);
  const accepted = ledger.fold(missed.map(viewOfChange), 'acc');
  const own = ledger.fold(pending.map(viewOfChange), 'own');
  const views = rebased.map(viewOfChange);
  const last = views.at(-1);
  const merged =
    emptyLast && last
      ? [...views.slice(0, -1), { ...last, roots: new Map() }]
      : views;

  return ledger.judge(accepted, own, ledger.foldMerged(accepted, merged));
};

const lettersIn = (value: Doc) =>
  value.children.reduce(
    (sum, block) =>
      block.children.reduce((count, leaf) => count + leaf.text.length, sum),
    0
  );

const ledgerLetters = (
  base: Doc,
  pending: readonly DocumentChange[],
  missed: readonly DocumentChange[],
  { head, rebased }: Reconnect
) => {
  const walk = (from: Doc, chain: readonly DocumentChange[]) => {
    let at = from;
    let sum = 0;

    for (const change of chain) {
      at = change.apply(at);
      sum += lettersIn(at);
    }

    return sum;
  };

  return {
    base: lettersIn(base),
    folded:
      lettersIn(base) +
      walk(base, missed) +
      walk(base, pending) +
      walk(head, rebased),
  };
};

const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

const install = ({ head, rebased }: Reconnect) =>
  rebased.reduce((value, change) => change.apply(value), head);

const spin = (ms: number) => {
  const until = performance.now() + ms;

  while (performance.now() < until);
};

const p95 = (samples: readonly number[]) =>
  [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1];

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const { values: flags } = parseArgs({
  options: {
    cohorts: { type: 'string' },
    judge: { type: 'string' },
    mode: { type: 'string' },
    'plant-loss': { type: 'boolean' },
    'plant-ms': { type: 'string' },
    reference: { type: 'string' },
    samples: { type: 'string' },
    warmup: { type: 'string' },
    'write-reference': { type: 'string' },
  },
});
const mode = flags.mode as Mode;
const samples = Number(flags.samples ?? 10);
const warmup = Number(flags.warmup ?? 1);
const plantMs = Number(flags['plant-ms'] ?? 0);
const chosen = flags.cohorts
  ? COHORTS.filter((cohort) => flags.cohorts?.split(',').includes(cohort.name))
  : COHORTS;

if (!(mode === 'budget' || Object.hasOwn(REBASE, mode))) {
  fail(`--mode takes budget or one of ${Object.keys(REBASE)}`);
}
const judging = flags.judge === 'whole';
const plantLoss = flags['plant-loss'] === true;

if (!(flags.judge === undefined || judging)) fail('--judge takes whole');
if (plantLoss && !judging) fail('--plant-loss needs --judge whole');
if (!(Number.isInteger(samples) && samples > 0)) {
  fail('--samples takes a whole number');
}
if (!(Number.isInteger(warmup) && warmup >= 0)) {
  fail('--warmup takes a whole number');
}
if (!(Number.isFinite(plantMs) && plantMs >= 0)) {
  fail('--plant-ms takes a duration');
}
if (chosen.length === 0) {
  fail(`--cohorts named no cohort of ${COHORTS.map((cohort) => cohort.name)}`);
}
if (mode !== 'budget' && !flags.reference && !flags['write-reference']) {
  fail(
    'a rebase mode compares against --reference or writes --write-reference'
  );
}

const reference: Reference | null = flags.reference
  ? JSON.parse(readFileSync(flags.reference, 'utf-8'))
  : null;
const written: Reference = {};
const results = chosen.map((cohort) => {
  if (mode === 'budget') {
    const started = performance.now();

    Bun.sleepSync(BUDGET_MS);
    const elapsed = performance.now() - started;

    return {
      cohort: cohort.name,
      mode,
      p95CpuMs: BUDGET_MS,
      p95Ms: elapsed,
    };
  }
  const base = baseDocument(cohort.blocks);
  const seed = cohort.blocks + (cohort.pattern === 'sparse' ? 1 : 2);
  const pending = queue(base, cohort, cohort.pending, 'x', seed);
  const missed = queue(base, cohort, cohort.missed, 'y', seed + 1000);
  const rebase = REBASE[mode];
  const timings: number[] = [];
  const cpuTimings: number[] = [];
  const judgeTimings: number[] = [];
  const judgeCpuTimings: number[] = [];
  const verdicts = { contested: 0, held: 0, lost: 0 };
  let last:
    | { installed: Doc; reconnect: Reconnect; verdict: Verdict | null }
    | undefined;

  for (let sample = 1 - warmup; sample <= samples; sample += 1) {
    const cpu = process.cpuUsage();
    const started = performance.now();
    const reconnect = rebase(base, pending, missed);
    const judgeCpu = process.cpuUsage();
    const judgeStarted = performance.now();
    const verdict = judging
      ? judgeReconnect(base, pending, missed, reconnect, plantLoss)
      : null;
    const judgeElapsed = performance.now() - judgeStarted;
    const judgeUsed = process.cpuUsage(judgeCpu);

    if (plantMs > 0) spin(plantMs);
    const installed = install(reconnect);
    const elapsed = performance.now() - started;
    const used = process.cpuUsage(cpu);

    if (sample > 0) {
      timings.push(elapsed);
      cpuTimings.push((used.user + used.system) / 1000);
      if (verdict) {
        verdicts[verdict.kind] += 1;
        judgeTimings.push(judgeElapsed);
        judgeCpuTimings.push((judgeUsed.user + judgeUsed.system) / 1000);
      }
    }
    last = { installed, reconnect, verdict };
  }
  if (!last) return fail('no sample ran');
  const { installed, reconnect, verdict } = last;

  if (
    judging &&
    verdicts.held + verdicts.contested + verdicts.lost !== samples
  ) {
    fail(`${cohort.name} ${mode}: the ledger judged fewer than ${samples}`);
  }
  if (plantLoss && verdicts.lost !== samples) {
    fail(
      `${cohort.name} ${mode}: the ledger read a merge that empties the last rebased change ${verdict?.kind}, not lost`
    );
  }
  const readBlocks = base.children.length;
  const rebasedDigests = reconnect.rebased.map((change) =>
    digest(change.toJSON())
  );
  const installedDigest = digest(installed);
  const rebaseRan =
    reconnect.cells > 0 &&
    reconnect.rebased.length === cohort.pending &&
    installed.children.length > readBlocks &&
    installedDigest !== digest(reconnect.head);

  if (readBlocks !== cohort.blocks) {
    fail(`${cohort.name} built ${readBlocks} blocks, not ${cohort.blocks}`);
  }
  if (pending.length !== cohort.pending || missed.length !== cohort.missed) {
    fail(`${cohort.name} queued ${pending.length} over ${missed.length}`);
  }
  if (!rebaseRan) fail(`${cohort.name} ${mode}: the rebase did not run`);
  written[cohort.name] = {
    installed: installedDigest,
    rebased: rebasedDigests,
  };
  const expected = reference?.[cohort.name];

  if (reference && !expected) fail(`the reference lacks ${cohort.name}`);

  return {
    blocks: readBlocks,
    cells: reconnect.cells,
    cohort: cohort.name,
    installedDiffers: expected ? expected.installed !== installedDigest : null,
    missed: missed.length,
    mode,
    p95CpuMs: p95(cpuTimings),
    p95Ms: p95(timings),
    pattern: cohort.pattern,
    pending: pending.length,
    plantMs,
    rebasedDiffering: expected
      ? rebasedDigests.filter((value, at) => value !== expected.rebased[at])
          .length
      : null,
    samples: timings.length,
    ...(verdict
      ? {
          judgeCpuTimings: judgeCpuTimings.map((value) => Math.round(value)),
          judgeTimings: judgeTimings.map((value) => Math.round(value)),
          letters: ledgerLetters(base, pending, missed, reconnect),
          p95JudgeCpuMs: p95(judgeCpuTimings),
          p95JudgeMs: p95(judgeTimings),
          verdict: {
            contests: verdict.contests.length,
            firstLoss: verdict.losses[0] ?? null,
            harms: verdict.harms.length,
            kind: verdict.kind,
            losses: verdict.losses.length,
          },
          verdicts,
        }
      : {}),
    cpuTimings: cpuTimings.map((value) => Math.round(value)),
    timings: timings.map((value) => Math.round(value)),
  };
});

if (flags['write-reference']) {
  writeFileSync(flags['write-reference'], JSON.stringify(written, null, 1));
}
console.log(
  JSON.stringify({
    label: `sync-reconnect ${mode}${judging ? ' judged whole' : ''}${plantLoss ? ' plant loss' : ''}${plantMs > 0 ? ` plant ${plantMs} ms` : ''}`,
    loaded: [
      fileURLToPath(import.meta.url),
      fileURLToPath(
        new URL('../../src/core/change/root-change.ts', import.meta.url)
      ),
      ...(judging
        ? [
            fileURLToPath(
              new URL('../../src/core/change/effect-ledger.ts', import.meta.url)
            ),
          ]
        : []),
    ],
    results,
  })
);
