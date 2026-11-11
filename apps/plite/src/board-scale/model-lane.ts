/**
 * The Scale gate's model lane. One run is one packet of one arm: it builds
 * each named cohort, reads its workload back, types one character per key
 * into the typed note's first paragraph and prints the final JSON line that
 * `.agents/rules/benchmark/scripts/paired-timing.mjs` reads.
 *
 * Bun, from source:
 *   bun --preload ./config/plite-source-aliases.ts apps/plite/src/board-scale/model-lane.ts <args>
 * Node, from each package's built dist:
 *   node apps/plite/src/board-scale/model-lane.ts <args>
 *
 * Args: --line m0|m1|m2|j1|h1|k1 --arm <arm> --layer plite|plate|composed
 *   --cohorts <name,...> --log-dir <dir> [--keys 120] [--warmup 20]
 *   [--known-bad N|A|S|F|B|position|placement|intent|H|K] [--factor <ratio>]
 *   [--cap-ms <ms>] [--tail-ratio <ratio>] [--state <file>] [--mode production|unset]
 *   [--deadline-s <s>]
 * Arms: base, candidate, copy, control-unframed, plant-string, plant-freeze,
 *   plant-slow, plant-bimodal, plant-tail, plant-pastcap.
 *
 * Each cohort runs in a process of its own under `NODE_ENV` as `--mode`
 * names it, production by default, so a later cohort never reads against a
 * base the earlier ones warmed. The parent prints the merged line.
 *
 * Each key records its wall time and its main-thread CPU time. The gate's
 * model lines judge `medianCpuMs` and `p95CpuMs`, and a synthetic plant sizes
 * and burns its slowdown on that CPU clock.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as nodeModule from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { Element } from 'plitejs';

import type {
  BoardDriver,
  BoardFixture,
  BoardWorkload,
  StoredNode,
  StoredValue,
  TextTarget,
} from './stub-board.ts';

const loadedUrls = new Set<string>();

const platejsRoot = fileURLToPath(
  new URL('../../../../packages/platejs/', import.meta.url)
);
const boardSource = path.join(platejsRoot, 'src/features/board/');

const boardSourceUrl = (specifier: string, parentURL: string | undefined) => {
  if (!specifier.startsWith('.') || !parentURL?.startsWith('file:')) {
    return null;
  }

  const target = path.resolve(
    path.dirname(fileURLToPath(parentURL)),
    specifier
  );
  const firstOf = (candidates: readonly string[]) =>
    candidates.find((candidate) => existsSync(candidate));
  const found = `${target}/`.startsWith(boardSource)
    ? firstOf([`${target}.ts`, path.join(target, 'index.ts')])
    : parentURL.includes('/packages/platejs/src/features/board/') &&
        target.startsWith(path.join(platejsRoot, 'src/'))
      ? firstOf(
          [
            `${path.relative(path.join(platejsRoot, 'src'), target)}.js`,
            path.join(
              path.relative(path.join(platejsRoot, 'src'), target),
              'index.js'
            ),
          ].map((file) => path.join(platejsRoot, 'dist', file))
        )
      : undefined;

  return found ? pathToFileURL(found).href : null;
};

// Node's ESM loader keeps no module cache to list, so a resolve hook records
// each file the run loads; it must be in place before the stub board imports.
if (!process.versions.bun) {
  nodeModule.registerHooks({
    resolve: (specifier, context, nextResolve) => {
      const board = boardSourceUrl(specifier, context.parentURL);
      const result = board
        ? {
            format: board.endsWith('.ts') ? 'module-typescript' : 'module',
            shortCircuit: true,
            url: board,
          }
        : nextResolve(specifier, context);
      loadedUrls.add(result.url);

      return result;
    },
  });
}

const args = new Map<string, string>();

for (let index = 2; index < process.argv.length; index += 2) {
  const flag = process.argv[index];
  const value = process.argv[index + 1];

  if (!flag?.startsWith('--') || value === undefined) {
    throw new Error(`model lane: expected --flag value pairs, got ${flag}`);
  }
  args.set(flag.slice(2), value);
}

const required = (name: string) => {
  const value = args.get(name);

  if (value === undefined) throw new Error(`model lane: --${name} is required`);

  return value;
};

const LINES = ['m0', 'm1', 'm2', 'j1', 'h1', 'k1'] as const;
const ARMS = [
  'base',
  'candidate',
  'copy',
  'control-unframed',
  'plant-string',
  'plant-freeze',
  'plant-slow',
  'plant-bimodal',
  'plant-tail',
  'plant-pastcap',
] as const;
const FAULTS = [
  'N',
  'A',
  'S',
  'F',
  'B',
  'position',
  'placement',
  'intent',
  'H',
  'K',
] as const;
const LAYERS = ['plite', 'plate', 'composed'] as const;
const MODES = ['production', 'unset'] as const;

const oneOf = <T extends string>(name: string, allowed: readonly T[]) => {
  const value = args.get(name) ?? (name === 'mode' ? 'production' : undefined);

  if (value === undefined) throw new Error(`model lane: --${name} is required`);
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(
      `model lane: --${name} ${value} is not one of ${allowed.join(', ')}`
    );
  }

  return value as T;
};

const line = oneOf('line', LINES);
const arm = oneOf('arm', ARMS);
const layer = oneOf('layer', LAYERS);
const mode = oneOf('mode', MODES);
const fault = args.has('known-bad') ? oneOf('known-bad', FAULTS) : undefined;
const keys = Number(args.get('keys') ?? 120);
const warmup = Number(args.get('warmup') ?? 20);
const factor = Number(
  args.get('factor') ?? (arm === 'plant-bimodal' ? 2 : 1.3)
);
const capMs = Number(args.get('cap-ms') ?? 2.5);
const tailRatio = Number(args.get('tail-ratio') ?? 1.5);
const deadlineMs = Number(args.get('deadline-s') ?? 500) * 1000;
const onBase =
  arm === 'base' || arm === 'control-unframed' || arm.startsWith('plant-');
const logDir = path.resolve(required('log-dir'));
const child = args.get('child') === '1';
const runtime = process.versions.bun
  ? `bun ${process.versions.bun}`
  : `node ${process.versions.node}`;

if (
  !(
    Number.isInteger(keys) &&
    keys >= 10 &&
    Number.isInteger(warmup) &&
    warmup >= 0
  )
) {
  throw new Error(
    'model lane: --keys must be an integer of at least 10 and --warmup a whole number'
  );
}
if (arm === 'plant-bimodal' && !child && !args.has('state')) {
  throw new Error(
    'model lane: plant-bimodal needs --state, the file that counts its packets'
  );
}
if (fault && onBase) {
  throw new Error(
    'model lane: a known-bad cohort breaks the measured arm, never base or a plant'
  );
}

type Hear =
  | 'none'
  | 'elsewhere'
  | 'three'
  | 'drop'
  | 'add-remove'
  | 'other-line'
  | 'same-line'
  | 'touch'
  | 'rounds-one'
  | 'rounds-five';

type Cohort = Readonly<{
  workload: BoardWorkload;
  hear?: Hear;
  keysBefore?: number;
}>;

const plain: BoardWorkload = {
  arrowsToTyped: 0,
  boards: 1,
  dense: false,
  frameMembers: 0,
  intent: 'plain',
  pending: 0,
  placement: 'spread',
  position: 'middle',
  shapes: 4000,
};
const suggesting: BoardWorkload = { ...plain, intent: 'suggesting' };

const COHORTS: Record<string, Cohort> = {
  A64: { workload: { ...plain, arrowsToTyped: 64 } },
  B10: { workload: { ...plain, boards: 10, shapes: 400 } },
  F1000: { workload: { ...plain, frameMembers: 1000 } },
  J4000: {
    workload: {
      ...plain,
      arrowsToTyped: 64,
      frameMembers: 1000,
      pending: 1000,
    },
  },
  N1000: { workload: { ...plain, shapes: 1000 } },
  N4000: { workload: plain },
  N50: { workload: { ...plain, shapes: 50 } },
  N8000: { workload: { ...plain, shapes: 8000 } },
  S1000: { workload: { ...plain, pending: 1000 } },
  'S1000-head': {
    workload: { ...plain, pending: 1000, placement: 'head' },
  },
  'S1000-head-suggest': {
    workload: { ...suggesting, pending: 1000, placement: 'head' },
  },
  'S1000-suggest': { workload: { ...suggesting, pending: 1000 } },
  first: { workload: { ...plain, position: 'first' } },
  last: { workload: { ...plain, position: 'last' } },
  'H-none': { hear: 'none', workload: plain },
  'H-elsewhere': { hear: 'elsewhere', workload: plain },
  'H-three': { hear: 'three', workload: plain },
  'H-drop': { hear: 'drop', workload: plain },
  'H-add-remove': { hear: 'add-remove', workload: plain },
  'H-other-line': { hear: 'other-line', workload: plain },
  'H-same-line': { hear: 'same-line', workload: plain },
  'H-touch': { hear: 'touch', workload: plain },
  'H-elsewhere-suggest': { hear: 'elsewhere', workload: suggesting },
  'H-touch-suggest': { hear: 'touch', workload: suggesting },
  'H-drop-suggest': { hear: 'drop', workload: suggesting },
  'H-rounds-one': { hear: 'rounds-one', workload: suggesting },
  'H-rounds-five': { hear: 'rounds-five', workload: suggesting },
  K6000: { keysBefore: 6000, workload: plain },
  'K6000-B10': {
    keysBefore: 6000,
    workload: { ...plain, boards: 10, shapes: 400 },
  },
};

const cohorts = required('cohorts').split(',');

for (const cohort of cohorts) {
  if (!COHORTS[cohort]) {
    throw new Error(
      `model lane: cohort ${cohort} is not one of ${Object.keys(COHORTS).join(', ')}`
    );
  }
  if ((line === 'h1') !== Boolean(COHORTS[cohort].hear)) {
    throw new Error(`model lane: cohort ${cohort} is not a ${line} cohort`);
  }
  if ((line === 'k1') !== Boolean(COHORTS[cohort].keysBefore)) {
    throw new Error(`model lane: cohort ${cohort} is not a ${line} cohort`);
  }
}

mkdirSync(logDir, { recursive: true });

const attemptPath = (stem: string) => {
  for (let attempt = 1; ; attempt++) {
    const candidate = path.join(logDir, `${stem}-a${attempt}.json`);

    if (!existsSync(candidate)) return candidate;
  }
};

const runStem = `${line}-${arm}-${layer}-${process.versions.bun ? 'bun' : 'node'}${mode === 'unset' ? '-unset' : ''}${fault ? `-bad-${fault}` : ''}`;

const bimodalSlow = () => {
  const state = path.resolve(required('state'));
  const count = existsSync(state) ? Number(readFileSync(state, 'utf-8')) : 0;
  writeFileSync(state, String((count + 1) % 6));

  return { packet: count, slow: count < 3 };
};

type LaneResult = Readonly<{
  label: string;
  loaded: string[];
  log: string;
  results: Array<Record<string, unknown>>;
}>;

const label = `${line} ${arm} ${layer} ${runtime}${mode === 'unset' ? ' NODE_ENV unset' : ''}${fault ? ` known-bad ${fault}` : ''}`;

if (!child) {
  const bimodal = arm === 'plant-bimodal' ? bimodalSlow() : undefined;
  const logPath = attemptPath(runStem);
  const runs: LaneResult[] = [];
  const passed = [...args].flatMap(([flag, value]) =>
    flag === 'cohorts' || flag === 'state' ? [] : [`--${flag}`, value]
  );

  for (const cohort of cohorts) {
    const env = { ...process.env };

    if (mode === 'production') env.NODE_ENV = 'production';
    else Reflect.deleteProperty(env, 'NODE_ENV');
    const run = spawnSync(
      process.execPath,
      [
        ...process.execArgv,
        fileURLToPath(import.meta.url),
        ...passed,
        '--cohorts',
        cohort,
        '--child',
        '1',
        ...(bimodal
          ? [
              '--bimodal-packet',
              String(bimodal.packet),
              '--bimodal-slow',
              bimodal.slow ? '1' : '0',
            ]
          : []),
      ],
      { encoding: 'utf-8', env, maxBuffer: 64 * 1024 * 1024 }
    );

    if (run.status !== 0) {
      process.stderr.write(run.stderr);
      writeFileSync(
        logPath,
        `${JSON.stringify({ args: Object.fromEntries(args), failed: cohort, runs, runtime, stderr: run.stderr.slice(-4000) }, null, 1)}\n`
      );
      throw new Error(
        `model lane: cohort ${cohort} failed in its own process: ${
          run.stderr
            .trim()
            .split('\n')
            .find(
              (text) => text.includes('cohort') || text.includes('model lane')
            ) ?? run.stderr.trim().split('\n').at(-1)
        }`
      );
    }
    const last = run.stdout.trim().split('\n').at(-1) ?? '';
    runs.push(JSON.parse(last) as LaneResult);
  }

  const loaded = [...new Set(runs.flatMap((run) => run.loaded))];
  writeFileSync(
    logPath,
    `${JSON.stringify({ args: Object.fromEntries(args), cohortLogs: runs.map((run) => run.log), mode, runtime }, null, 1)}\n`
  );
  // Exit only once the line is flushed, or a pipe reads it cut off.
  await new Promise((resolve) => {
    process.stdout.write(
      `${JSON.stringify({
        label,
        loaded,
        log: logPath,
        results: runs.flatMap((run) => run.results),
      })}\n`,
      resolve
    );
  });
  process.exit(0);
}

const modeRead = process.env.NODE_ENV;

if ((mode === 'production' ? 'production' : undefined) !== modeRead) {
  throw new Error(
    `model lane: read back NODE_ENV ${JSON.stringify(modeRead ?? null)}, but the lane runs ${mode}`
  );
}

const stub = await import('./stub-board.ts');
const { NodeApi, createEditorView } = await import('plitejs');
const { yjs } = await import('plitejs/yjs');
const Y = await import('yjs');

const [cohort] = cohorts;
const logPath = attemptPath(`${runStem}-${cohort}`);
const entry: Record<string, unknown> = {
  arm,
  cohort,
  fault: fault ?? null,
  mode: modeRead ?? null,
};
const log = { args: Object.fromEntries(args), entry, runtime };
const writeLog = () =>
  writeFileSync(logPath, `${JSON.stringify(log, null, 1)}\n`);

const bimodal = args.has('bimodal-packet')
  ? {
      packet: Number(args.get('bimodal-packet')),
      slow: args.get('bimodal-slow') === '1',
    }
  : undefined;

const cpuNow = () => {
  const { system, user } = process.threadCpuUsage();

  return (user + system) / 1000;
};

const burnCpu = (ms: number) => {
  const end = cpuNow() + ms;

  while (cpuNow() < end) {
    // Spin until the thread has used `ms` of CPU.
  }
};

const percentile = (sorted: readonly number[], ratio: number) =>
  sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];

const fail = (message: string): never => {
  writeLog();
  throw new Error(message);
};

type Workload =
  | { kind: 'board'; claim: BoardWorkload; fixture: BoardFixture }
  | {
      kind: 'flat';
      blocks: number;
      textPath: number[];
      value: { children: Array<Record<string, unknown>> };
    };

const controlOf = (claim: BoardWorkload): BoardWorkload => ({
  ...COHORTS.N50.workload,
  intent: claim.intent,
  ...(claim.pending > 0 && arm !== 'control-unframed'
    ? { pending: 12, placement: claim.placement }
    : {}),
});

const claimOf = (name: string): Cohort => {
  const claimed = COHORTS[name];

  if (fault === 'H') return { ...claimed, hear: 'none' };
  if (fault === 'K') return { ...claimed, keysBefore: 1000 };

  return claimed;
};

const workloadOf = (
  name: string
): { keysBefore: number; workload: Workload } => {
  const claimed = claimOf(name);
  const claim = claimed.workload;
  const boardFault = fault === 'H' || fault === 'K' ? undefined : fault;
  const board = (workload: BoardWorkload): Workload => ({
    claim: workload,
    fixture: stub.buildBoardFixture(workload, boardFault),
    kind: 'board',
  });

  if (line === 'm0' && onBase) {
    const blocks = stub.readBoardWorkload(
      stub.buildBoardFixture(COHORTS.N50.workload).value,
      '',
      [],
      { x: 0, y: 0, zoom: 1 },
      false
    ).blockCount;

    return {
      keysBefore: 0,
      workload: { blocks, kind: 'flat', ...stub.buildFlatFixture(blocks) },
    };
  }
  if (line === 'k1') {
    return {
      keysBefore: onBase ? 1000 : (claimed.keysBefore ?? 0),
      workload: board(claim),
    };
  }
  if (line === 'h1') {
    return {
      keysBefore: 0,
      workload: board(onBase ? { ...claim, shapes: 50 } : claim),
    };
  }

  return { keysBefore: 0, workload: board(onBase ? controlOf(claim) : claim) };
};

const plantTarget = (name: string) => {
  if (arm !== 'plant-string' && arm !== 'plant-freeze') return undefined;

  const built = stub.buildBoardFixture(COHORTS[name].workload);
  const children = stub
    .createBoardDriver(layer, built.value)
    .rootChildren(built.typed.root);

  return { children, type: 'board' } as Element;
};

const checkReadback = (workload: Workload, driver: BoardDriver) => {
  const stored = driver.stored();

  if (workload.kind === 'flat') {
    const blocks = stored.children.length;
    entry.readback = { blocks, collaboration: false, roots: 0 };
    writeLog();

    if (blocks !== workload.blocks || stored.roots) {
      fail(
        `cohort ${cohort}: read back ${blocks} flat blocks and ${Object.keys(stored.roots ?? {}).length} roots, but the flat control claims ${workload.blocks} and none`
      );
    }

    return;
  }

  const readback = stub.readBoardWorkload(
    stored,
    workload.fixture.typed.shapeId,
    driver.pendingShapes(),
    workload.fixture.camera,
    false
  );
  const expected = stub.expectedReadback(workload.claim);
  entry.readback = readback;
  writeLog();

  for (const [field, want] of Object.entries(expected)) {
    const got = readback[field as keyof typeof expected];

    if (JSON.stringify(got) !== JSON.stringify(want)) {
      fail(
        `cohort ${cohort}: read back ${field} ${JSON.stringify(got)}, but its name claims ${JSON.stringify(want)}`
      );
    }
  }
};

const nodeAt = (stored: StoredValue, target: TextTarget) => {
  let node: StoredNode | undefined = {
    children: target.root ? stored.roots?.[target.root] : stored.children,
  };

  for (const index of target.path.slice(0, -1)) node = node?.children?.[index];

  return node;
};

const textAt = (stored: StoredValue, target: TextTarget) =>
  (nodeAt(stored, target)?.children ?? [])
    .map((leaf) => leaf.text ?? '')
    .join('');

const lettersIn = (
  nodes: readonly StoredNode[] | undefined,
  letter: string
): number =>
  (nodes ?? []).reduce(
    (sum, node) =>
      sum +
      (typeof node.text === 'string'
        ? node.text.split(letter).length - 1
        : lettersIn(node.children, letter)),
    0
  );

const plantWork = (
  target: ReturnType<typeof plantTarget>,
  work: { frozenEntries: number; stringChars: number }
) => {
  if (!target) return;
  if (arm === 'plant-string') work.stringChars += NodeApi.string(target).length;
  else work.frozenEntries += Object.freeze([...target.children]).length;
};

type ViewTx = {
  nodes: {
    insert: (node: unknown, options: { at: number[] }) => void;
    remove: (options: { at: number[] }) => void;
    set: (props: object, options: { at: number[] }) => void;
  };
};
type PeerTx = {
  history: { newBatch: () => void };
  selection: { set: (range: unknown) => void };
  text: { insert: (text: string) => void };
};

const createTeammate = (
  driver: BoardDriver,
  fixture: BoardFixture,
  hear: Hear
) => {
  const docA = new Y.Doc();
  docA.clientID = 1;
  const docB = new Y.Doc();
  docB.clientID = 2;
  driver.editor.install(
    yjs({ doc: docA, initialReady: true, seed: true }) as never
  );
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
  const peer = stub.createBoardDriver(layer, fixture.value);
  peer.editor.install(yjs({ doc: docB, initialReady: true }) as never);
  const send = (
    from: InstanceType<typeof Y.Doc>,
    to: InstanceType<typeof Y.Doc>
  ) => Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));
  const { root } = fixture.typed;
  const [typedIndex] = fixture.typed.textPath;
  const shapes = driver.rootChildren(root) as ReadonlyArray<{ type?: string }>;
  const notes = shapes.flatMap((shape, index) =>
    shape.type === 'boardNote' && index !== typedIndex ? [index] : []
  );
  const far = notes[Math.floor(notes.length / 4)];
  const roundNotes = [
    typedIndex,
    ...notes.filter((index) => index > typedIndex).slice(0, 4),
  ];
  const peerView = createEditorView(peer.editor as never, {
    root,
  }) as unknown as {
    update: (run: (tx: ViewTx) => void) => void;
  };
  const typingUpdate = driver.editor.update as (
    run: (tx: PeerTx) => void
  ) => void;
  const peerSelect: Partial<Record<Hear, TextTarget & { offset: number }>> = {
    elsewhere: { offset: 0, path: [far, 1, 0], root },
    'other-line': { offset: 0, path: [typedIndex, 2, 0], root },
    'same-line': {
      offset: 'First item'.length,
      path: [typedIndex, 1, 0],
      root,
    },
    three: { offset: 0, path: [far, 1, 0], root },
    touch: { offset: 0, path: [typedIndex, 1, 0], root },
  };
  const placed = peerSelect[hear];

  if (placed) peer.select(placed, placed.offset);
  let heard = 0;
  let observed = 0;
  let peerLetters = 0;
  const shapeCount = shapes.length;
  const heardLetters = (indexes: readonly number[]) => {
    const children = driver.rootChildren(root);

    return lettersIn(
      indexes.map((index) => children[index] as StoredNode),
      'q'
    );
  };

  return {
    toB: () => send(docA, docB),
    hear: (key: number): TextTarget | null => {
      heard += 1;
      if (hear === 'none') return null;
      if (
        hear === 'elsewhere' ||
        hear === 'other-line' ||
        hear === 'same-line' ||
        hear === 'touch' ||
        hear === 'three'
      ) {
        const count = hear === 'three' ? 3 : 1;

        for (let typed = 0; typed < count; typed++) peer.type('q');
        peerLetters += count;
        send(docB, docA);
        const got = heardLetters([placed?.path[0] ?? typedIndex]);

        if (got !== peerLetters) {
          fail(
            `cohort ${cohort}: the typing peer read back ${got} of the teammate's letters before key ${key}, but H ${hear} sent ${peerLetters}`
          );
        }
        observed += 1;

        return null;
      }
      if (hear === 'drop') {
        const place = { x: 10_000 + key, y: 10_000 };
        peerView.update((tx) => tx.nodes.set({ place }, { at: [far] }));
        send(docB, docA);
        const got = (driver.rootChildren(root)[far] as { place?: unknown })
          ?.place;

        if (JSON.stringify(got) !== JSON.stringify(place)) {
          fail(
            `cohort ${cohort}: the typing peer read back place ${JSON.stringify(got)} on shape ${far} before key ${key}, but the teammate dropped it at ${JSON.stringify(place)}`
          );
        }
        observed += 1;

        return null;
      }
      if (hear === 'add-remove') {
        const at = shapeCount;

        if (heard % 2 === 1) {
          peerView.update((tx) =>
            tx.nodes.insert(
              {
                children: [
                  { children: [{ text: 'Added' }], type: 'paragraph' },
                ],
                place: { x: 0, y: 0 },
                shapeId: `h1-added-${key}`,
                size: { height: 10, width: 10 },
                type: 'boardGeo',
                zIndex: 'd0000',
              },
              { at: [at] }
            )
          );
        } else {
          peerView.update((tx) => tx.nodes.remove({ at: [at] }));
        }
        send(docB, docA);
        const got = driver.rootChildren(root).length;
        const want = shapeCount + (heard % 2);

        if (got !== want) {
          fail(
            `cohort ${cohort}: the typing peer read back ${got} shapes before key ${key}, but the teammate's add and remove leave ${want}`
          );
        }
        observed += 1;

        return null;
      }

      const note =
        hear === 'rounds-five'
          ? roundNotes[key % roundNotes.length]
          : typedIndex;
      const start = { offset: 2, path: [note, 1, 0], root };

      typingUpdate((tx) => {
        tx.history.newBatch();
        tx.selection.set(stub.collapsedAt(start, 2));
      });
      for (let typed = 0; typed < 5; typed++) driver.type('k');
      send(docA, docB);
      peer.select(start, 2);
      peer.type('q');
      peerLetters += 1;
      send(docB, docA);
      const got = heardLetters(roundNotes);

      if (got !== peerLetters) {
        fail(
          `cohort ${cohort}: the typing peer read back ${got} of the teammate's letters before round ${key}, but H ${hear} sent ${peerLetters}`
        );
      }
      observed += 1;

      return start;
    },
    observed: () => observed,
    agree: () => {
      send(docA, docB);
      send(docB, docA);
      const a = JSON.stringify(driver.stored());
      const b = JSON.stringify(peer.stored());

      return a === b;
    },
  };
};

const measure = (name: string) => {
  const { keysBefore, workload } = workloadOf(name);
  const claimed = claimOf(name);
  const value =
    workload.kind === 'board' ? workload.fixture.value : workload.value;
  const target: TextTarget =
    workload.kind === 'board'
      ? {
          path: workload.fixture.typed.textPath,
          root: workload.fixture.typed.root,
        }
      : { path: workload.textPath };
  entry.kind = workload.kind;
  const buildStart = performance.now();
  const intent =
    workload.kind === 'board' ? workload.claim.intent : ('plain' as const);
  const driver = stub.createBoardDriver(
    layer,
    value,
    fault === 'intent' ? (intent === 'plain' ? 'suggesting' : 'plain') : intent
  );
  entry.buildMs = performance.now() - buildStart;
  checkReadback(workload, driver);

  const plant = plantTarget(name);

  if (plant) entry.plantTarget = { children: plant.children.length };

  const teammate =
    line === 'h1' && workload.kind === 'board'
      ? createTeammate(driver, workload.fixture, claimed.hear ?? 'none')
      : undefined;

  entry.hear = claimed.hear ?? null;
  const pendingBefore = driver.pendingShapes().length;
  const textBefore = textAt(driver.stored(), target);
  driver.select(target);

  const keysStart = performance.now();

  for (let key = 0; key < keysBefore; key++) {
    driver.type('k');
    if (performance.now() - keysStart > deadlineMs) {
      fail(
        `cohort ${cohort}: K ${keysBefore} did not finish in ${deadlineMs / 1000} s, ${key + 1} keys typed`
      );
    }
  }
  entry.keysBeforeMs = performance.now() - keysStart;
  if (!teammate) {
    const designed =
      line === 'k1' ? (onBase ? 1000 : (COHORTS[cohort].keysBefore ?? 0)) : 0;
    const typedBefore =
      /^k*/.exec(textAt(driver.stored(), target))?.[0].length ?? 0;

    entry.keysBefore = typedBefore;
    writeLog();
    if (typedBefore !== designed) {
      fail(
        `cohort ${cohort}: read back ${typedBefore} keys before the timed keys, but its name claims ${designed}`
      );
    }
  }

  const samples: number[] = [];
  const cpuSamples: number[] = [];
  const work = { busyMs: 0, delayedKeys: 0, frozenEntries: 0, stringChars: 0 };
  const undelayed: number[] = [];
  const lettersBefore = lettersIn(
    driver.stored().roots?.[target.root ?? ''],
    'x'
  );

  for (let key = 0; key < warmup + keys; key++) {
    teammate?.hear(key);
    const start = performance.now();
    const cpuStart = cpuNow();
    driver.type('x');
    plantWork(plant, work);

    const own = cpuNow() - cpuStart;
    const extra =
      arm === 'plant-slow' || (arm === 'plant-bimodal' && bimodal?.slow)
        ? own * (factor - 1)
        : arm === 'plant-tail' && key % 10 === 9
          ? Math.max(
              0,
              tailRatio *
                percentile(
                  [...undelayed].sort((left, right) => left - right),
                  0.95
                ) -
                own
            )
          : arm === 'plant-pastcap'
            ? Math.max(0, capMs + 0.25 - own)
            : 0;

    if (extra > 0) {
      burnCpu(extra);
      work.busyMs += extra;
      work.delayedKeys += 1;
    } else if (key >= 10) {
      undelayed.push(own);
    }
    if (key >= warmup) {
      cpuSamples.push(cpuNow() - cpuStart);
      samples.push(performance.now() - start);
    }
    teammate?.toB();
  }

  entry.samples = samples;
  entry.cpuSamples = cpuSamples;
  entry.work = work;

  const typedIntent = stub.readIntent(
    pendingBefore,
    driver.pendingShapes().length
  );
  entry.intent = typedIntent;
  writeLog();

  if (typedIntent !== intent) {
    fail(
      `cohort ${cohort}: read back intent ${JSON.stringify(typedIntent)}, but its name claims ${JSON.stringify(intent)}`
    );
  }

  if (teammate) {
    const letters =
      lettersIn(driver.stored().roots?.[target.root ?? ''], 'x') -
      lettersBefore;

    const heardWant =
      (COHORTS[cohort].hear ?? 'none') === 'none' ? 0 : warmup + keys;

    const heard = teammate.observed();

    entry.heard = heard;
    entry.collaboration = teammate.agree();
    writeLog();
    if (heard !== heardWant) {
      fail(
        `cohort ${cohort}: read back ${heard} teammate changes heard, but its name claims ${heardWant}`
      );
    }
    if (letters !== warmup + keys) {
      fail(
        `cohort ${cohort}: the typing peer's root holds ${letters} typed keys, not ${warmup + keys}`
      );
    }
    if (!entry.collaboration) {
      fail(
        `cohort ${cohort}: the receiving peer's document differs from the typing peer's after the typed keys`
      );
    }
  } else {
    const typed = textAt(driver.stored(), target);
    const expectedText =
      'k'.repeat(keysBefore) + 'x'.repeat(warmup + keys) + textBefore;

    if (typed !== expectedText) {
      fail(
        `cohort ${cohort}: the typed paragraph reads ${JSON.stringify(typed.slice(0, 40))}, not ${warmup + keys} typed keys after ${keysBefore} before ${JSON.stringify(textBefore)}`
      );
    }
  }
  if (arm === 'plant-string' && work.stringChars === 0) {
    fail(`cohort ${cohort}: plant-string read no text`);
  }
  if (arm === 'plant-freeze' && work.frozenEntries === 0) {
    fail(`cohort ${cohort}: plant-freeze froze no entries`);
  }
  if (['plant-slow', 'plant-tail'].includes(arm) && work.delayedKeys === 0) {
    fail(`cohort ${cohort}: ${arm} delayed no key`);
  }
  if (
    arm === 'plant-bimodal' &&
    bimodal?.slow &&
    work.delayedKeys !== warmup + keys
  ) {
    fail(
      `cohort ${cohort}: plant-bimodal is slow in packet ${bimodal.packet} but delayed ${work.delayedKeys} keys`
    );
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const sortedCpu = [...cpuSamples].sort((left, right) => left - right);
  const p95CpuMs = percentile(sortedCpu, 0.95);

  if (arm === 'plant-pastcap' && p95CpuMs <= capMs) {
    fail(
      `cohort ${cohort}: plant-pastcap reads CPU p95 ${p95CpuMs} ms, not past the ${capMs} ms cap`
    );
  }

  return {
    cohort,
    keys,
    medianCpuMs: percentile(sortedCpu, 0.5),
    medianMs: percentile(sorted, 0.5),
    mode: modeRead ?? null,
    p95CpuMs,
    p95Ms: percentile(sorted, 0.95),
    work: { ...work, bimodal },
  };
};

const result = measure(cohort);
const packageRoots = ['/packages/plitejs/', '/packages/platejs/'];
const loaded = [
  fileURLToPath(import.meta.url),
  ...(process.versions.bun
    ? Object.keys(nodeModule.createRequire(import.meta.url).cache)
    : [...loadedUrls]
        .filter((url) => url.startsWith('file:'))
        .map((url) => fileURLToPath(url))),
].filter(
  (file, index, files) =>
    files.indexOf(file) === index &&
    (file.includes('/apps/plite/src/board-scale/') ||
      packageRoots.some((root) => file.includes(root)))
);

if (!packageRoots.every((root) => loaded.some((file) => file.includes(root)))) {
  fail(`model lane: loaded no file from ${packageRoots.join(' or ')}`);
}

entry.loaded = loaded.length;
writeLog();
process.stdout.write(
  `${JSON.stringify({ label, loaded, log: logPath, results: [result] })}\n`
);
